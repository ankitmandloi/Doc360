import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { GameColor, GamePhase } from '../config';

// Types
export interface User {
  id: string;
  username: string;
  phone: string;
  password: string; // Simple hash for demo
  name: string;
  balance: number;
  referralCode: string;
  referredBy: string | null; // userId of referrer
  referralCount: number; // How many users this user has referred
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

interface DatabaseState {
  users: Map<string, User>;
  otps: Map<string, OTP>;
  rounds: Round[];
  currentRound: Round | null;
}

const DATA_FILE = path.join(__dirname, '../../data/db.json');

class Database {
  private state: DatabaseState = {
    users: new Map(),
    otps: new Map(),
    rounds: [],
    currentRound: null,
  };

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        this.state.users = new Map(Object.entries(data.users || {}));
        this.state.rounds = data.rounds || [];
        console.log('[DB] Loaded state from file');
      }
    } catch (error) {
      console.log('[DB] No existing data file, starting fresh');
    }
  }

  private saveToFile() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const data = {
        users: Object.fromEntries(this.state.users),
        rounds: this.state.rounds.slice(-100),
      };
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[DB] Error saving to file:', error);
    }
  }

  // Generate unique referral code
  generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    for (const user of this.state.users.values()) {
      if (user.referralCode === code) {
        return this.generateReferralCode();
      }
    }
    return code;
  }

  // User operations
  createUser(user: User): User {
    this.state.users.set(user.id, user);
    this.saveToFile();
    return user;
  }

  getUser(id: string): User | null {
    return this.state.users.get(id) || null;
  }

  getUserByUsername(username: string): User | null {
    for (const user of this.state.users.values()) {
      if (user.username === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  getUserByPhone(phone: string): User | null {
    for (const user of this.state.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  getUserByReferralCode(referralCode: string): User | null {
    for (const user of this.state.users.values()) {
      if (user.referralCode === referralCode.toUpperCase()) {
        return user;
      }
    }
    return null;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const user = this.state.users.get(userId);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    this.state.users.set(userId, updatedUser);
    this.saveToFile();
    return updatedUser;
  }

  updateUserBalance(userId: string, delta: number): User | null {
    const user = this.state.users.get(userId);
    if (!user) return null;
    
    user.balance = Math.max(0, user.balance + delta);
    this.state.users.set(userId, user);
    this.saveToFile();
    return user;
  }

  setUserBalance(userId: string, balance: number): User | null {
    const user = this.state.users.get(userId);
    if (!user) return null;
    
    user.balance = Math.max(0, balance);
    this.state.users.set(userId, user);
    this.saveToFile();
    return user;
  }

  incrementReferralCount(userId: string): User | null {
    const user = this.state.users.get(userId);
    if (!user) return null;
    
    user.referralCount = (user.referralCount || 0) + 1;
    this.state.users.set(userId, user);
    this.saveToFile();
    return user;
  }

  // OTP operations
  createOTP(phone: string, code: string, expiresAt: number): OTP {
    const otp: OTP = {
      id: uuidv4(),
      phone,
      code,
      expiresAt,
      verified: false,
      createdAt: Date.now(),
    };
    this.state.otps.set(phone, otp);
    return otp;
  }

  getOTP(phone: string): OTP | null {
    return this.state.otps.get(phone) || null;
  }

  verifyOTP(phone: string): boolean {
    const otp = this.state.otps.get(phone);
    if (otp) {
      otp.verified = true;
      this.state.otps.set(phone, otp);
      return true;
    }
    return false;
  }

  deleteOTP(phone: string): void {
    this.state.otps.delete(phone);
  }

  // Round operations
  createRound(round: Round): Round {
    this.state.currentRound = round;
    return round;
  }

  getCurrentRound(): Round | null {
    return this.state.currentRound;
  }

  updateRoundPhase(phase: GamePhase): Round | null {
    if (!this.state.currentRound) return null;
    this.state.currentRound.phase = phase;
    return this.state.currentRound;
  }

  setWinningColor(color: GameColor): Round | null {
    if (!this.state.currentRound) return null;
    this.state.currentRound.winningColor = color;
    this.state.currentRound.winRevealedAt = Date.now();
    return this.state.currentRound;
  }

  completeRound(): Round | null {
    if (!this.state.currentRound) return null;
    
    const completedRound = { ...this.state.currentRound };
    completedRound.phase = 'COMPLETE';
    this.state.rounds.push(completedRound);
    this.saveToFile();
    
    return completedRound;
  }

  getRoundHistory(limit: number = 10): Round[] {
    return this.state.rounds.slice(-limit).reverse();
  }

  getRoundById(id: string): Round | null {
    if (this.state.currentRound?.id === id) {
      return this.state.currentRound;
    }
    return this.state.rounds.find(r => r.id === id) || null;
  }

  // Bet operations
  placeBet(userId: string, roundId: string, amount: number, color: GameColor): Bet | null {
    if (!this.state.currentRound) return null;
    if (this.state.currentRound.phase !== 'BETTING') return null;
    if (this.state.currentRound.id !== roundId) return null;

    const user = this.state.users.get(userId);
    if (!user || user.balance < amount) return null;

    // Check if user already bet this round
    const existingBet = this.state.currentRound.bets.find(b => b.userId === userId);
    if (existingBet) return null;

    // Deduct balance
    user.balance -= amount;
    this.state.users.set(userId, user);

    const newBet: Bet = {
      id: uuidv4(),
      roundId,
      userId,
      amount,
      color,
      wonAmount: 0,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.state.currentRound.bets.push(newBet);
    this.saveToFile();
    
    return newBet;
  }

  getUserBets(userId: string, limit: number = 10): Bet[] {
    const allBets: Bet[] = [];
    
    if (this.state.currentRound) {
      const currentBets = this.state.currentRound.bets.filter(b => b.userId === userId);
      allBets.push(...currentBets);
    }
    
    for (const round of this.state.rounds.slice().reverse()) {
      const roundBets = round.bets.filter(b => b.userId === userId);
      allBets.push(...roundBets);
      if (allBets.length >= limit) break;
    }
    
    return allBets.slice(0, limit);
  }

  getUserBetForCurrentRound(userId: string): Bet | null {
    if (!this.state.currentRound) return null;
    return this.state.currentRound.bets.find(b => b.userId === userId) || null;
  }

  getAllRecentBets(limit: number = 20): Bet[] {
    const allBets: Bet[] = [];
    
    // Include bets from current round
    if (this.state.currentRound) {
      allBets.push(...this.state.currentRound.bets);
    }
    
    // Include bets from completed rounds
    for (const round of this.state.rounds.slice().reverse()) {
      allBets.push(...round.bets);
      if (allBets.length >= limit) break;
    }
    
    // Sort by creation time (newest first) and limit
    return allBets
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  processRoundResults(winningColor: GameColor, multipliers: Record<GameColor, number>): void {
    if (!this.state.currentRound) return;

    for (const bet of this.state.currentRound.bets) {
      if (bet.color === winningColor) {
        bet.status = 'won';
        bet.wonAmount = bet.amount * multipliers[winningColor];
        
        const user = this.state.users.get(bet.userId);
        if (user) {
          user.balance += bet.wonAmount;
          this.state.users.set(bet.userId, user);
        }
      } else {
        bet.status = 'lost';
        bet.wonAmount = 0;
      }
    }
    
    this.saveToFile();
  }

  getState() {
    return {
      users: Array.from(this.state.users.values()),
      rounds: this.state.rounds.length,
      currentRound: this.state.currentRound,
    };
  }
}

export const db = new Database();
