"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betController = void 0;
const bet_service_1 = require("./bet.service");
exports.betController = {
    placeBet: (req, res) => {
        try {
            // Get userId from authenticated request
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const { color, amount } = req.body;
            // Validate input
            const validation = bet_service_1.placeBetSchema.safeParse({ userId, color, amount });
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: validation.error.errors[0]?.message || 'Invalid input',
                });
            }
            const result = bet_service_1.betService.placeBet(validation.data);
            if (result.success) {
                return res.json({
                    success: true,
                    data: {
                        bet: result.bet,
                        potentialWin: result.potentialWin,
                    },
                });
            }
            else {
                return res.status(400).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Bets] Place bet error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    updateBet: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const { betId, color, amount } = req.body;
            if (!betId || !color || !amount) {
                return res.status(400).json({ success: false, error: 'Missing required fields' });
            }
            const result = bet_service_1.betService.updateBet(betId, userId, color, amount);
            if (result.success) {
                return res.json({
                    success: true,
                    data: {
                        bet: result.bet,
                        potentialWin: result.potentialWin,
                    },
                });
            }
            else {
                return res.status(400).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Bets] Update bet error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    removeBet: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const { betId } = req.body;
            if (!betId) {
                return res.status(400).json({ success: false, error: 'Missing betId' });
            }
            const result = bet_service_1.betService.removeBet(betId, userId);
            if (result.success) {
                return res.json({ success: true });
            }
            else {
                return res.status(400).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Bets] Remove bet error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    getUserBets: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const limit = parseInt(req.query.limit) || 10;
            const bets = bet_service_1.betService.getUserBets(userId, limit);
            return res.json({ success: true, data: bets });
        }
        catch (error) {
            console.error('[Bets] Get user bets error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    getCurrentBet: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const bet = bet_service_1.betService.getUserBetForCurrentRound(userId);
            return res.json({ success: true, data: bet });
        }
        catch (error) {
            console.error('[Bets] Get current bet error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    getCurrentBets: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const bets = bet_service_1.betService.getUserBetsForCurrentRound(userId);
            return res.json({ success: true, data: bets });
        }
        catch (error) {
            console.error('[Bets] Get current bets error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    getAllBets: (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const bets = bet_service_1.betService.getAllRecentBets(limit);
            return res.json({ success: true, data: bets });
        }
        catch (error) {
            console.error('[Bets] Get all bets error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    getTopWinners: (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 30;
            const bets = bet_service_1.betService.getTopWinners(limit);
            return res.json({ success: true, data: bets });
        }
        catch (error) {
            console.error('[Bets] Get top winners error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=bet.controller.js.map