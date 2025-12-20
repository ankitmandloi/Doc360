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

    // Place the bet (multiple bets now allowed)
    const bet = db.placeBet(userId, gameState.roundId, amount, color as GameColor);
    
    if (!bet) {
      return { success: false, error: 'Failed to place bet' };
    }

    const potentialWin = amount * config.multipliers[color as GameColor];

    return { success: true, bet, potentialWin };
  }

  updateBet(betId: string, userId: string, color: GameColor, amount: number): { success: boolean; bet?: Bet; potentialWin?: number; error?: string } {
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

    // Update the bet
    const bet = db.updateBet(betId, userId, amount, color);
    
    if (!bet) {
      return { success: false, error: 'Failed to update bet or insufficient balance' };
    }

    const potentialWin = amount * config.multipliers[color];

    return { success: true, bet, potentialWin };
  }

  removeBet(betId: string, userId: string): { success: boolean; error?: string } {
    // Get current game state
    const gameState = gameScheduler.getGameState();
    if (!gameState) {
      return { success: false, error: 'Game not initialized' };
    }

    // Check if in betting phase
    if (gameState.phase !== 'BETTING') {
      return { success: false, error: 'Betting is not open' };
    }

    // Remove the bet
    const success = db.removeBet(betId, userId);
    
    if (!success) {
      return { success: false, error: 'Failed to remove bet' };
    }

    return { success: true };
  }

  getUserBets(userId: string, limit: number = 10): Bet[] {
    return db.getUserBets(userId, limit);
  }

  getUserBetForCurrentRound(userId: string): Bet | null {
    return db.getUserBetForCurrentRound(userId);
  }

  getUserBetsForCurrentRound(userId: string): Bet[] {
    return db.getUserBetsForCurrentRound(userId);
  }

  getAllRecentBets(limit: number = 20): Bet[] {
    return db.getAllRecentBets(limit);
  }
}

export const betService = new BetService();
