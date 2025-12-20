export declare const config: {
    port: number;
    host: string;
    nodeEnv: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    frontendUrl: string;
    otp: {
        length: number;
        expiresInMinutes: number;
    };
    referral: {
        bonusAmount: number;
        codeLength: number;
    };
    game: {
        initDuration: number;
        bettingDuration: number;
        winningDuration: number;
        initialBalance: number;
        readonly totalDuration: number;
    };
    multipliers: {
        readonly red: 1.98;
        readonly green: 1.98;
        readonly blue: 5;
    };
    colorRanges: {
        readonly red: {
            readonly min: 0;
            readonly max: 39;
        };
        readonly blue: {
            readonly min: 40;
            readonly max: 59;
        };
        readonly green: {
            readonly min: 60;
            readonly max: 99;
        };
    };
};
export type GameColor = 'red' | 'green' | 'blue';
export type GamePhase = 'INIT' | 'BETTING' | 'WINNING' | 'COMPLETE';
//# sourceMappingURL=index.d.ts.map