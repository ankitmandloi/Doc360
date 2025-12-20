"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameService = void 0;
const config_1 = require("../../config");
const database_1 = require("../../db/database");
const game_scheduler_1 = require("./game.scheduler");
class GameService {
    getGameState() {
        return game_scheduler_1.gameScheduler.getGameState();
    }
    getFairnessData(roundId) {
        const round = database_1.db.getRoundById(roundId);
        if (!round)
            return null;
        // Only reveal seed after round is complete
        if (round.phase !== 'COMPLETE') {
            return {
                roundId: round.id,
                serverSeed: '***HIDDEN***',
                serverSeedHash: round.serverSeedHash,
                winningColor: round.winningColor,
                randomNumber: -1,
            };
        }
        return {
            roundId: round.id,
            serverSeed: round.serverSeed,
            serverSeedHash: round.serverSeedHash,
            winningColor: round.winningColor,
            randomNumber: -1, // Would need to recalculate
        };
    }
    getRoundHistory(limit = 10) {
        return database_1.db.getRoundHistory(limit).map(round => ({
            id: round.id,
            winningColor: round.winningColor,
            totalBets: round.bets.length,
            startTimestamp: round.startTimestamp,
        }));
    }
    getMultipliers() {
        return config_1.config.multipliers;
    }
    getColorProbabilities() {
        const { colorRanges } = config_1.config;
        return {
            red: `${colorRanges.red.max - colorRanges.red.min + 1}%`,
            green: `${colorRanges.green.max - colorRanges.green.min + 1}%`,
            blue: `${colorRanges.blue.max - colorRanges.blue.min + 1}%`,
        };
    }
}
exports.gameService = new GameService();
//# sourceMappingURL=game.service.js.map