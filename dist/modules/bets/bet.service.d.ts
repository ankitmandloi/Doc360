import { z } from 'zod';
import { GameColor } from '../../config';
import { Bet } from '../../db/database';
export declare const placeBetSchema: z.ZodObject<{
    userId: z.ZodString;
    color: z.ZodEnum<["red", "green", "blue"]>;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    userId: string;
    color: "red" | "green" | "blue";
    amount: number;
}, {
    userId: string;
    color: "red" | "green" | "blue";
    amount: number;
}>;
export type PlaceBetInput = z.infer<typeof placeBetSchema>;
declare class BetService {
    placeBet(input: PlaceBetInput): {
        success: boolean;
        bet?: Bet;
        potentialWin?: number;
        error?: string;
    };
    updateBet(betId: string, userId: string, color: GameColor, amount: number): {
        success: boolean;
        bet?: Bet;
        potentialWin?: number;
        error?: string;
    };
    removeBet(betId: string, userId: string): {
        success: boolean;
        error?: string;
    };
    getUserBets(userId: string, limit?: number): Bet[];
    getUserBetForCurrentRound(userId: string): Bet | null;
    getUserBetsForCurrentRound(userId: string): Bet[];
    getAllRecentBets(limit?: number): Bet[];
    getTopWinners(limit?: number): Bet[];
}
export declare const betService: BetService;
export {};
//# sourceMappingURL=bet.service.d.ts.map