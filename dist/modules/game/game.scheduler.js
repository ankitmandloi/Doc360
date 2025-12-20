"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameScheduler = void 0;
const config_1 = require("../../config");
const database_1 = require("../../db/database");
const game_fairness_1 = require("./game.fairness");
class GameScheduler {
    currentRound = null;
    phaseStartedAt = 0;
    phaseEndsAt = 0;
    winRevealTimeout = null;
    phaseTimeout = null;
    dailyGameCount = 0;
    currentDate = '';
    start() {
        console.log('[Scheduler] Starting game scheduler...');
        this.initializeDailyCounter();
        this.startNewRound();
    }
    stop() {
        if (this.phaseTimeout)
            clearTimeout(this.phaseTimeout);
        if (this.winRevealTimeout)
            clearTimeout(this.winRevealTimeout);
        console.log('[Scheduler] Stopped');
    }
    initializeDailyCounter() {
        const today = new Date();
        const dateStr = today.getFullYear().toString() +
            (today.getMonth() + 1).toString().padStart(2, '0') +
            today.getDate().toString().padStart(2, '0');
        if (this.currentDate !== dateStr) {
            this.currentDate = dateStr;
            this.dailyGameCount = 0;
        }
    }
    generateGameId() {
        this.initializeDailyCounter();
        this.dailyGameCount++;
        const gameNumber = this.dailyGameCount.toString().padStart(4, '0');
        return `${this.currentDate}${gameNumber}`;
    }
    startNewRound() {
        const roundId = this.generateGameId();
        const serverSeed = (0, game_fairness_1.generateServerSeed)();
        const serverSeedHash = (0, game_fairness_1.hashServerSeed)(serverSeed);
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
        database_1.db.createRound(this.currentRound);
        this.phaseStartedAt = now;
        this.phaseEndsAt = now + config_1.config.game.initDuration;
        console.log(`[Scheduler] New round started: ${roundId}`);
        // Schedule transition to betting phase
        this.phaseTimeout = setTimeout(() => {
            this.transitionToBetting();
        }, config_1.config.game.initDuration);
    }
    transitionToBetting() {
        if (!this.currentRound)
            return;
        const now = Date.now();
        this.currentRound.phase = 'BETTING';
        this.phaseStartedAt = now;
        this.phaseEndsAt = now + config_1.config.game.bettingDuration;
        database_1.db.updateRoundPhase('BETTING');
        console.log(`[Scheduler] Round ${this.currentRound.id} -> BETTING`);
        // Schedule transition to winning phase
        this.phaseTimeout = setTimeout(() => {
            this.transitionToWinning();
        }, config_1.config.game.bettingDuration);
    }
    transitionToWinning() {
        if (!this.currentRound)
            return;
        const now = Date.now();
        this.currentRound.phase = 'WINNING';
        this.phaseStartedAt = now;
        this.phaseEndsAt = now + config_1.config.game.winningDuration;
        database_1.db.updateRoundPhase('WINNING');
        console.log(`[Scheduler] Round ${this.currentRound.id} -> WINNING`);
        // Schedule winner reveal at random time within winning phase
        const revealDelay = Math.floor((Math.random() * config_1.config.game.winningDuration * 0.7) +
            (config_1.config.game.winningDuration * 0.15));
        this.winRevealTimeout = setTimeout(() => {
            this.revealWinner();
        }, revealDelay);
        // Schedule round completion
        this.phaseTimeout = setTimeout(() => {
            this.completeRound();
        }, config_1.config.game.winningDuration);
    }
    revealWinner() {
        if (!this.currentRound || this.currentRound.winningColor)
            return;
        const result = (0, game_fairness_1.generateFairnessResult)(this.currentRound.serverSeed);
        this.currentRound.winningColor = result.winningColor;
        this.currentRound.winRevealedAt = Date.now();
        database_1.db.setWinningColor(result.winningColor);
        database_1.db.processRoundResults(result.winningColor, config_1.config.multipliers);
        console.log(`[Scheduler] Winner revealed: ${result.winningColor} (random: ${result.randomNumber})`);
    }
    completeRound() {
        if (!this.currentRound)
            return;
        // Ensure winner is revealed
        if (!this.currentRound.winningColor) {
            this.revealWinner();
        }
        this.currentRound.phase = 'COMPLETE';
        database_1.db.completeRound();
        console.log(`[Scheduler] Round ${this.currentRound.id} -> COMPLETE`);
        // Start next round after a short delay
        setTimeout(() => {
            this.startNewRound();
        }, 500);
    }
    // Public methods
    getGameState() {
        if (!this.currentRound)
            return null;
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
    getCurrentRound() {
        return this.currentRound;
    }
}
exports.gameScheduler = new GameScheduler();
//# sourceMappingURL=game.scheduler.js.map