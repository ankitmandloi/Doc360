import * as crypto from 'crypto';
import { config, GameColor } from '../../config';

/**
 * Generate a cryptographically secure server seed
 */
export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash the server seed for public display (before reveal)
 */
export function hashServerSeed(seed: string): string {
  return crypto.createHash('sha256').update(seed).digest('hex');
}

/**
 * Generate a random number 0-99 using the server seed
 */
export function generateRandomNumber(seed: string): number {
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
export function determineWinningColor(randomNumber: number): GameColor {
  const { colorRanges } = config;
  
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
export function generateFairnessResult(serverSeed: string): {
  randomNumber: number;
  winningColor: GameColor;
} {
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
export function verifyRoundResult(
  serverSeed: string,
  declaredHash: string,
  declaredColor: GameColor
): boolean {
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
export function getColorProbabilities(): Record<GameColor, string> {
  const { colorRanges } = config;
  
  const redRange = colorRanges.red.max - colorRanges.red.min + 1;
  const greenRange = colorRanges.green.max - colorRanges.green.min + 1;
  const blueRange = colorRanges.blue.max - colorRanges.blue.min + 1;
  
  return {
    red: `${redRange}%`,
    green: `${greenRange}%`,
    blue: `${blueRange}%`,
  };
}

