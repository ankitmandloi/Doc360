// Configuration - uses environment variables with defaults
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0', // 0.0.0.0 allows LAN access
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'color_crash_jwt_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // OTP Configuration
  otp: {
    length: 6,
    expiresInMinutes: 5,
  },
  
  // Referral Configuration
  referral: {
    bonusAmount: 250, // $250 for both referrer and referee
    codeLength: 8,
  },
  
  // Game timings (in milliseconds)
  game: {
    initDuration: parseInt(process.env.ROUND_INIT_DURATION || '15', 10) * 1000,
    bettingDuration: parseInt(process.env.ROUND_BETTING_DURATION || '30', 10) * 1000,
    winningDuration: parseInt(process.env.ROUND_WINNING_DURATION || '15', 10) * 1000,
    initialBalance: 1000, // Starting balance for new users
    get totalDuration() {
      return this.initDuration + this.bettingDuration + this.winningDuration;
    },
  },
  
  // Multipliers
  multipliers: {
    red: 1.98,
    green: 1.98,
    blue: 5,
  } as const,
  
  // Color probability ranges (0-99)
  colorRanges: {
    red: { min: 0, max: 39 },     // 40% chance -> x1.98
    blue: { min: 40, max: 59 },   // 20% chance -> x5
    green: { min: 60, max: 99 },  // 40% chance -> x1.98
  } as const,
};

export type GameColor = 'red' | 'green' | 'blue';
export type GamePhase = 'INIT' | 'BETTING' | 'WINNING' | 'COMPLETE';
