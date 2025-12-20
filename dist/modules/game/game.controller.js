"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameController = void 0;
const game_service_1 = require("./game.service");
exports.gameController = {
    getState: (req, res) => {
        try {
            const state = game_service_1.gameService.getGameState();
            if (!state) {
                return res.status(503).json({
                    error: 'Game not initialized',
                    message: 'Please wait for the game to start'
                });
            }
            res.json({
                success: true,
                data: state,
            });
        }
        catch (error) {
            console.error('[GameController] getState error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getFairness: (req, res) => {
        try {
            const { roundId } = req.params;
            if (!roundId) {
                return res.status(400).json({ error: 'Round ID is required' });
            }
            const fairnessData = game_service_1.gameService.getFairnessData(roundId);
            if (!fairnessData) {
                return res.status(404).json({ error: 'Round not found' });
            }
            res.json({
                success: true,
                data: fairnessData,
            });
        }
        catch (error) {
            console.error('[GameController] getFairness error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getHistory: (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const history = game_service_1.gameService.getRoundHistory(limit);
            res.json({
                success: true,
                data: history,
            });
        }
        catch (error) {
            console.error('[GameController] getHistory error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    getConfig: (req, res) => {
        try {
            res.json({
                success: true,
                data: {
                    multipliers: game_service_1.gameService.getMultipliers(),
                    probabilities: game_service_1.gameService.getColorProbabilities(),
                },
            });
        }
        catch (error) {
            console.error('[GameController] getConfig error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=game.controller.js.map