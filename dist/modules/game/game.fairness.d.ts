import { GameColor } from '../../config';
/**
 * Generate a cryptographically secure server seed
 */
export declare function generateServerSeed(): string;
/**
 * Hash the server seed for public display (before reveal)
 */
export declare function hashServerSeed(seed: string): string;
/**
 * Generate a random number 0-99 using the server seed
 */
export declare function generateRandomNumber(seed: string): number;
/**
 * Determine winning color based on random number
 *
 * Distribution:
 * - Red (x1.98):   0-39  (40% chance)
 * - Blue (x5):     40-59 (20% chance)
 * - Green (x1.98): 60-99 (40% chance)
 */
export declare function determineWinningColor(randomNumber: number): GameColor;
/**
 * Generate a complete fairness result
 */
export declare function generateFairnessResult(serverSeed: string): {
    randomNumber: number;
    winningColor: GameColor;
};
/**
 * Verify a round result (for transparency)
 */
export declare function verifyRoundResult(serverSeed: string, declaredHash: string, declaredColor: GameColor): boolean;
/**
 * Get probability percentages for each color
 */
export declare function getColorProbabilities(): Record<GameColor, string>;
//# sourceMappingURL=game.fairness.d.ts.map