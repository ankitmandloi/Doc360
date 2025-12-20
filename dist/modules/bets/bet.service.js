"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betService = exports.placeBetSchema = void 0;
const zod_1 = require("zod");
const config_1 = require("../../config");
const database_1 = require("../../db/database");
const game_scheduler_1 = require("../game/game.scheduler");
// Validation schema
exports.placeBetSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    color: zod_1.z.enum(['red', 'green', 'blue']),
    amount: zod_1.z.number().positive().multipleOf(10),
});
class BetService {
    placeBet(input) {
        const { userId, color, amount } = input;
        // Get current game state
        const gameState = game_scheduler_1.gameScheduler.getGameState();
        if (!gameState) {
            return { success: false, error: 'Game not initialized' };
        }
        // Check if in betting phase
        if (gameState.phase !== 'BETTING') {
            return { success: false, error: 'Betting is not open' };
        }
        // Check user exists
        const user = database_1.db.getUser(userId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        // Check balance
        if (user.balance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }
        // Place the bet (multiple bets now allowed)
        const bet = database_1.db.placeBet(userId, gameState.roundId, amount, color);
        if (!bet) {
            return { success: false, error: 'Failed to place bet' };
        }
        const potentialWin = amount * config_1.config.multipliers[color];
        return { success: true, bet, potentialWin };
    }
    updateBet(betId, userId, color, amount) {
        // Get current game state
        const gameState = game_scheduler_1.gameScheduler.getGameState();
        if (!gameState) {
            return { success: false, error: 'Game not initialized' };
        }
        // Check if in betting phase
        if (gameState.phase !== 'BETTING') {
            return { success: false, error: 'Betting is not open' };
        }
        // Check user exists
        const user = database_1.db.getUser(userId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        // Update the bet
        const bet = database_1.db.updateBet(betId, userId, amount, color);
        if (!bet) {
            return { success: false, error: 'Failed to update bet or insufficient balance' };
        }
        const potentialWin = amount * config_1.config.multipliers[color];
        return { success: true, bet, potentialWin };
    }
    removeBet(betId, userId) {
        // Get current game state
        const gameState = game_scheduler_1.gameScheduler.getGameState();
        if (!gameState) {
            return { success: false, error: 'Game not initialized' };
        }
        // Check if in betting phase
        if (gameState.phase !== 'BETTING') {
            return { success: false, error: 'Betting is not open' };
        }
        // Remove the bet
        const success = database_1.db.removeBet(betId, userId);
        if (!success) {
            return { success: false, error: 'Failed to remove bet' };
        }
        return { success: true };
    }
    getUserBets(userId, limit = 10) {
        return database_1.db.getUserBets(userId, limit);
    }
    getUserBetForCurrentRound(userId) {
        return database_1.db.getUserBetForCurrentRound(userId);
    }
    getUserBetsForCurrentRound(userId) {
        return database_1.db.getUserBetsForCurrentRound(userId);
    }
    getAllRecentBets(limit = 20) {
        return database_1.db.getAllRecentBets(limit);
    }
    getTopWinners(limit = 30) {
        return database_1.db.getTopWinners(limit);
    }
}
exports.betService = new BetService();
//# sourceMappingURL=bet.service.js.map