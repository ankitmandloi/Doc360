import { Round } from '../../db/database';
import { GameState } from './game.types';
declare class GameScheduler {
    private currentRound;
    private phaseStartedAt;
    private phaseEndsAt;
    private winRevealTimeout;
    private phaseTimeout;
    private dailyGameCount;
    private currentDate;
    start(): void;
    stop(): void;
    private initializeDailyCounter;
    private generateGameId;
    private startNewRound;
    private transitionToBetting;
    private transitionToWinning;
    private revealWinner;
    private completeRound;
    getGameState(): GameState | null;
    getCurrentRound(): Round | null;
}
export declare const gameScheduler: GameScheduler;
export {};
//# sourceMappingURL=game.scheduler.d.ts.map