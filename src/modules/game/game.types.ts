import { GameColor, GamePhase } from '../../config';

export interface GameState {
  roundId: string;
  phase: GamePhase;
  phaseStartedAt: number;
  phaseEndsAt: number;
  millisecondsRemaining: number;
  serverTimestamp: number;
  winningColor: GameColor | null;
  winRevealedAt: number | null;
  totalBets: number;
}

export interface RoundResult {
  roundId: string;
  winningColor: GameColor;
  serverSeedHash: string;
  totalBets: number;
  totalPayout: number;
}

export interface FairnessData {
  roundId: string;
  serverSeed: string;
  serverSeedHash: string;
  winningColor: GameColor;
  randomNumber: number;
}

