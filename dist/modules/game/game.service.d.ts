import { GameColor } from '../../config';
import { GameState, FairnessData } from './game.types';
declare class GameService {
    getGameState(): GameState | null;
    getFairnessData(roundId: string): FairnessData | null;
    getRoundHistory(limit?: number): {
        id: string;
        winningColor: GameColor | null;
        totalBets: number;
        startTimestamp: number;
    }[];
    getMultipliers(): {
        readonly red: 1.98;
        readonly green: 1.98;
        readonly blue: 5;
    };
    getColorProbabilities(): {
        red: string;
        green: string;
        blue: string;
    };
}
export declare const gameService: GameService;
export {};
//# sourceMappingURL=game.service.d.ts.map