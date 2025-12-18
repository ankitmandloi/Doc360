import { config, GameColor } from '../../config';
import { db } from '../../db/database';
import { gameScheduler } from './game.scheduler';
import { GameState, FairnessData } from './game.types';

class GameService {
  getGameState(): GameState | null {
    return gameScheduler.getGameState();
  }

  getFairnessData(roundId: string): FairnessData | null {
    const round = db.getRoundById(roundId);
    if (!round) return null;

    // Only reveal seed after round is complete
    if (round.phase !== 'COMPLETE') {
      return {
        roundId: round.id,
        serverSeed: '***HIDDEN***',
        serverSeedHash: round.serverSeedHash,
        winningColor: round.winningColor!,
        randomNumber: -1,
      };
    }

    return {
      roundId: round.id,
      serverSeed: round.serverSeed,
      serverSeedHash: round.serverSeedHash,
      winningColor: round.winningColor!,
      randomNumber: -1, // Would need to recalculate
    };
  }

  getRoundHistory(limit: number = 10) {
    return db.getRoundHistory(limit).map(round => ({
      id: round.id,
      winningColor: round.winningColor,
      totalBets: round.bets.length,
      startTimestamp: round.startTimestamp,
    }));
  }

  getMultipliers() {
    return config.multipliers;
  }

  getColorProbabilities() {
    const { colorRanges } = config;
    return {
      red: `${colorRanges.red.max - colorRanges.red.min + 1}%`,
      green: `${colorRanges.green.max - colorRanges.green.min + 1}%`,
      blue: `${colorRanges.blue.max - colorRanges.blue.min + 1}%`,
    };
  }
}

export const gameService = new GameService();

