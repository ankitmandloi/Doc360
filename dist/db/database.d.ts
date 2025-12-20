import { GameColor, GamePhase } from '../config';
export interface User {
    id: string;
    username: string;
    phone: string;
    password: string;
    name: string;
    balance: number;
    referralCode: string;
    referredBy: string | null;
    referralCount: number;
    isPhoneVerified: boolean;
    createdAt: number;
}
export interface OTP {
    id: string;
    phone: string;
    code: string;
    expiresAt: number;
    verified: boolean;
    createdAt: number;
}
export interface Round {
    id: string;
    startTimestamp: number;
    phase: GamePhase;
    serverSeed: string;
    serverSeedHash: string;
    winningColor: GameColor | null;
    winRevealedAt: number | null;
    bets: Bet[];
}
export interface Bet {
    id: string;
    roundId: string;
    userId: string;
    amount: number;
    color: GameColor;
    wonAmount: number;
    status: 'pending' | 'won' | 'lost';
    createdAt: number;
}
declare class Database {
    private state;
    constructor();
    private loadFromFile;
    private saveToFile;
    generateReferralCode(): string;
    createUser(user: User): User;
    getUser(id: string): User | null;
    getUserByUsername(username: string): User | null;
    getUserByPhone(phone: string): User | null;
    getUserByReferralCode(referralCode: string): User | null;
    updateUser(userId: string, updates: Partial<User>): User | null;
    updateUserBalance(userId: string, delta: number): User | null;
    setUserBalance(userId: string, balance: number): User | null;
    incrementReferralCount(userId: string): User | null;
    createOTP(phone: string, code: string, expiresAt: number): OTP;
    getOTP(phone: string): OTP | null;
    verifyOTP(phone: string): boolean;
    deleteOTP(phone: string): void;
    createRound(round: Round): Round;
    getCurrentRound(): Round | null;
    updateRoundPhase(phase: GamePhase): Round | null;
    setWinningColor(color: GameColor): Round | null;
    completeRound(): Round | null;
    getRoundHistory(limit?: number): Round[];
    getRoundById(id: string): Round | null;
    placeBet(userId: string, roundId: string, amount: number, color: GameColor): Bet | null;
    updateBet(betId: string, userId: string, amount: number, color: GameColor): Bet | null;
    removeBet(betId: string, userId: string): boolean;
    getUserBets(userId: string, limit?: number): Bet[];
    getUserBetForCurrentRound(userId: string): Bet | null;
    getUserBetsForCurrentRound(userId: string): Bet[];
    getAllRecentBets(limit?: number): Bet[];
    getTopWinners(limit?: number): Bet[];
    processRoundResults(winningColor: GameColor, multipliers: Record<GameColor, number>): void;
    getState(): {
        users: User[];
        rounds: number;
        currentRound: Round | null;
    };
}
export declare const db: Database;
export {};
//# sourceMappingURL=database.d.ts.map