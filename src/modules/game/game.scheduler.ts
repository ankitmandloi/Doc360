import { v4 as uuidv4 } from 'uuid';
import { config, GamePhase, GameColor } from '../../config';
import { db, Round } from '../../db/database';
import { generateServerSeed, hashServerSeed, generateFairnessResult } from './game.fairness';
import { GameState } from './game.types';

class GameScheduler {
  private currentRound: Round | null = null;
  private phaseStartedAt: number = 0;
  private phaseEndsAt: number = 0;
  private winRevealTimeout: NodeJS.Timeout | null = null;
  private phaseTimeout: NodeJS.Timeout | null = null;
  private dailyGameCount: number = 0;
  private currentDate: string = '';

  start() {
    console.log('[Scheduler] Starting game scheduler...');
    this.initializeDailyCounter();
    this.startNewRound();
  }

  stop() {
    if (this.phaseTimeout) clearTimeout(this.phaseTimeout);
    if (this.winRevealTimeout) clearTimeout(this.winRevealTimeout);
    console.log('[Scheduler] Stopped');
  }

  private initializeDailyCounter() {
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    if (this.currentDate !== dateStr) {
      this.currentDate = dateStr;
      this.dailyGameCount = 0;
    }
  }

  private generateGameId(): string {
    this.initializeDailyCounter();
    this.dailyGameCount++;
    const gameNumber = this.dailyGameCount.toString().padStart(4, '0');
    return `${this.currentDate}${gameNumber}`;
  }

  private startNewRound() {
    const roundId = this.generateGameId();
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashServerSeed(serverSeed);
    const now = Date.now();

    this.currentRound = {
      id: roundId,
      startTimestamp: now,
      phase: 'INIT',
      serverSeed,
      serverSeedHash,
      winningColor: null,
      winRevealedAt: null,
      bets: [],
    };

    db.createRound(this.currentRound);
    
    this.phaseStartedAt = now;
    this.phaseEndsAt = now + config.game.initDuration;

    console.log(`[Scheduler] New round started: ${roundId}`);

    // Schedule transition to betting phase
    this.phaseTimeout = setTimeout(() => {
      this.transitionToBetting();
    }, config.game.initDuration);
  }

  private transitionToBetting() {
    if (!this.currentRound) return;

    const now = Date.now();
    this.currentRound.phase = 'BETTING';
    this.phaseStartedAt = now;
    this.phaseEndsAt = now + config.game.bettingDuration;
    
    db.updateRoundPhase('BETTING');
    
    console.log(`[Scheduler] Round ${this.currentRound.id} -> BETTING`);

    // Schedule transition to winning phase
    this.phaseTimeout = setTimeout(() => {
      this.transitionToWinning();
    }, config.game.bettingDuration);
  }

  private transitionToWinning() {
    if (!this.currentRound) return;

    const now = Date.now();
    this.currentRound.phase = 'WINNING';
    this.phaseStartedAt = now;
    this.phaseEndsAt = now + config.game.winningDuration;
    
    db.updateRoundPhase('WINNING');
    
    console.log(`[Scheduler] Round ${this.currentRound.id} -> WINNING`);

    // Schedule winner reveal at random time within winning phase
    const revealDelay = Math.floor(
      (Math.random() * config.game.winningDuration * 0.7) + 
      (config.game.winningDuration * 0.15)
    );

    this.winRevealTimeout = setTimeout(() => {
      this.revealWinner();
    }, revealDelay);

    // Schedule round completion
    this.phaseTimeout = setTimeout(() => {
      this.completeRound();
    }, config.game.winningDuration);
  }

  private revealWinner() {
    if (!this.currentRound || this.currentRound.winningColor) return;

    const result = generateFairnessResult(this.currentRound.serverSeed);
    this.currentRound.winningColor = result.winningColor;
    this.currentRound.winRevealedAt = Date.now();

    db.setWinningColor(result.winningColor);
    db.processRoundResults(result.winningColor, config.multipliers);

    console.log(`[Scheduler] Winner revealed: ${result.winningColor} (random: ${result.randomNumber})`);
  }

  private completeRound() {
    if (!this.currentRound) return;

    // Ensure winner is revealed
    if (!this.currentRound.winningColor) {
      this.revealWinner();
    }

    this.currentRound.phase = 'COMPLETE';
    db.completeRound();

    console.log(`[Scheduler] Round ${this.currentRound.id} -> COMPLETE`);

    // Start next round after a short delay
    setTimeout(() => {
      this.startNewRound();
    }, 500);
  }

  // Public methods
  getGameState(): GameState | null {
    if (!this.currentRound) return null;

    const now = Date.now();
    const millisecondsRemaining = Math.max(0, this.phaseEndsAt - now);

    return {
      roundId: this.currentRound.id,
      phase: this.currentRound.phase,
      phaseStartedAt: this.phaseStartedAt,
      phaseEndsAt: this.phaseEndsAt,
      millisecondsRemaining,
      serverTimestamp: now,
      winningColor: this.currentRound.winningColor,
      winRevealedAt: this.currentRound.winRevealedAt,
      totalBets: this.currentRound.bets.length,
    };
  }

  getCurrentRound(): Round | null {
    return this.currentRound;
  }
}

export const gameScheduler = new GameScheduler();
