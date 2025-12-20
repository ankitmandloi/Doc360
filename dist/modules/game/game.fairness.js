"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServerSeed = generateServerSeed;
exports.hashServerSeed = hashServerSeed;
exports.generateRandomNumber = generateRandomNumber;
exports.determineWinningColor = determineWinningColor;
exports.generateFairnessResult = generateFairnessResult;
exports.verifyRoundResult = verifyRoundResult;
exports.getColorProbabilities = getColorProbabilities;
const crypto = __importStar(require("crypto"));
const config_1 = require("../../config");
/**
 * Generate a cryptographically secure server seed
 */
function generateServerSeed() {
    return crypto.randomBytes(32).toString('hex');
}
/**
 * Hash the server seed for public display (before reveal)
 */
function hashServerSeed(seed) {
    return crypto.createHash('sha256').update(seed).digest('hex');
}
/**
 * Generate a random number 0-99 using the server seed
 */
function generateRandomNumber(seed) {
    const hash = crypto.createHash('sha256').update(seed + Date.now().toString()).digest();
    const randomValue = hash.readUInt32BE(0);
    return randomValue % 100;
}
/**
 * Determine winning color based on random number
 *
 * Distribution:
 * - Red (x1.98):   0-39  (40% chance)
 * - Blue (x5):     40-59 (20% chance)
 * - Green (x1.98): 60-99 (40% chance)
 */
function determineWinningColor(randomNumber) {
    const { colorRanges } = config_1.config;
    if (randomNumber >= colorRanges.red.min && randomNumber <= colorRanges.red.max) {
        return 'red';
    }
    if (randomNumber >= colorRanges.green.min && randomNumber <= colorRanges.green.max) {
        return 'green';
    }
    return 'blue';
}
/**
 * Generate a complete fairness result
 */
function generateFairnessResult(serverSeed) {
    const randomNumber = generateRandomNumber(serverSeed);
    const winningColor = determineWinningColor(randomNumber);
    return {
        randomNumber,
        winningColor,
    };
}
/**
 * Verify a round result (for transparency)
 */
function verifyRoundResult(serverSeed, declaredHash, declaredColor) {
    const computedHash = hashServerSeed(serverSeed);
    if (computedHash !== declaredHash) {
        return false;
    }
    const result = generateFairnessResult(serverSeed);
    return result.winningColor === declaredColor;
}
/**
 * Get probability percentages for each color
 */
function getColorProbabilities() {
    const { colorRanges } = config_1.config;
    const redRange = colorRanges.red.max - colorRanges.red.min + 1;
    const greenRange = colorRanges.green.max - colorRanges.green.min + 1;
    const blueRange = colorRanges.blue.max - colorRanges.blue.min + 1;
    return {
        red: `${redRange}%`,
        green: `${greenRange}%`,
        blue: `${blueRange}%`,
    };
}
//# sourceMappingURL=game.fairness.js.map