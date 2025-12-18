import { z } from 'zod';
import { config, GameColor } from '../../config';
import { db, Bet } from '../../db/database';
import { gameScheduler } from '../game/game.scheduler';

// Validation schema
export const placeBetSchema = z.object({
  userId: z.string().min(1),
  color: z.enum(['red', 'green', 'blue']),
  amount: z.number().positive().multipleOf(10),
});

export type PlaceBetInput = z.infer<typeof placeBetSchema>;

class BetService {
  placeBet(input: PlaceBetInput): { success: boolean; bet?: Bet; potentialWin?: number; error?: string } {
    const { userId, color, amount } = input;

    // Get current game state
    const gameState = gameScheduler.getGameState();
    if (!gameState) {
      return { success: false, error: 'Game not initialized' };
    }

    // Check if in betting phase
    if (gameState.phase !== 'BETTING') {
      return { success: false, error: 'Betting is not open' };
    }

    // Check user exists
    const user = db.getUser(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check balance
    if (user.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Check if user already bet this round
    const existingBet = db.getUserBetForCurrentRound(userId);
    if (existingBet) {
      return { success: false, error: 'Already placed a bet this round' };
    }

    // Place the bet
    const bet = db.placeBet(userId, gameState.roundId, amount, color as GameColor);
    
    if (!bet) {
      return { success: false, error: 'Failed to place bet' };
    }

    const potentialWin = amount * config.multipliers[color as GameColor];

    return { success: true, bet, potentialWin };
  }

  getUserBets(userId: string, limit: number = 10): Bet[] {
    return db.getUserBets(userId, limit);
  }

  getUserBetForCurrentRound(userId: string): Bet | null {
    return db.getUserBetForCurrentRound(userId);
  }

  getAllRecentBets(limit: number = 20): Bet[] {
    return db.getAllRecentBets(limit);
  }
}

export const betService = new BetService();
