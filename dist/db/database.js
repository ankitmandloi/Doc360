"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DATA_FILE = path.join(__dirname, '../../data/db.json');
class Database {
    state = {
        users: new Map(),
        otps: new Map(),
        rounds: [],
        currentRound: null,
    };
    constructor() {
        this.loadFromFile();
    }
    loadFromFile() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
                this.state.users = new Map(Object.entries(data.users || {}));
                this.state.rounds = data.rounds || [];
                console.log('[DB] Loaded state from file');
            }
        }
        catch (error) {
            console.log('[DB] No existing data file, starting fresh');
        }
    }
    saveToFile() {
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
        }
        catch (error) {
            console.error('[DB] Error saving to file:', error);
        }
    }
    // Generate unique referral code
    generateReferralCode() {
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
    createUser(user) {
        this.state.users.set(user.id, user);
        this.saveToFile();
        return user;
    }
    getUser(id) {
        return this.state.users.get(id) || null;
    }
    getUserByUsername(username) {
        for (const user of this.state.users.values()) {
            if (user.username === username.toLowerCase()) {
                return user;
            }
        }
        return null;
    }
    getUserByPhone(phone) {
        for (const user of this.state.users.values()) {
            if (user.phone === phone) {
                return user;
            }
        }
        return null;
    }
    getUserByReferralCode(referralCode) {
        for (const user of this.state.users.values()) {
            if (user.referralCode === referralCode.toUpperCase()) {
                return user;
            }
        }
        return null;
    }
    updateUser(userId, updates) {
        const user = this.state.users.get(userId);
        if (!user)
            return null;
        const updatedUser = { ...user, ...updates };
        this.state.users.set(userId, updatedUser);
        this.saveToFile();
        return updatedUser;
    }
    updateUserBalance(userId, delta) {
        const user = this.state.users.get(userId);
        if (!user)
            return null;
        user.balance = Math.max(0, user.balance + delta);
        this.state.users.set(userId, user);
        this.saveToFile();
        return user;
    }
    setUserBalance(userId, balance) {
        const user = this.state.users.get(userId);
        if (!user)
            return null;
        user.balance = Math.max(0, balance);
        this.state.users.set(userId, user);
        this.saveToFile();
        return user;
    }
    incrementReferralCount(userId) {
        const user = this.state.users.get(userId);
        if (!user)
            return null;
        user.referralCount = (user.referralCount || 0) + 1;
        this.state.users.set(userId, user);
        this.saveToFile();
        return user;
    }
    // OTP operations
    createOTP(phone, code, expiresAt) {
        const otp = {
            id: (0, uuid_1.v4)(),
            phone,
            code,
            expiresAt,
            verified: false,
            createdAt: Date.now(),
        };
        this.state.otps.set(phone, otp);
        return otp;
    }
    getOTP(phone) {
        return this.state.otps.get(phone) || null;
    }
    verifyOTP(phone) {
        const otp = this.state.otps.get(phone);
        if (otp) {
            otp.verified = true;
            this.state.otps.set(phone, otp);
            return true;
        }
        return false;
    }
    deleteOTP(phone) {
        this.state.otps.delete(phone);
    }
    // Round operations
    createRound(round) {
        this.state.currentRound = round;
        return round;
    }
    getCurrentRound() {
        return this.state.currentRound;
    }
    updateRoundPhase(phase) {
        if (!this.state.currentRound)
            return null;
        this.state.currentRound.phase = phase;
        return this.state.currentRound;
    }
    setWinningColor(color) {
        if (!this.state.currentRound)
            return null;
        this.state.currentRound.winningColor = color;
        this.state.currentRound.winRevealedAt = Date.now();
        return this.state.currentRound;
    }
    completeRound() {
        if (!this.state.currentRound)
            return null;
        const completedRound = { ...this.state.currentRound };
        completedRound.phase = 'COMPLETE';
        this.state.rounds.push(completedRound);
        this.saveToFile();
        return completedRound;
    }
    getRoundHistory(limit = 10) {
        return this.state.rounds.slice(-limit).reverse();
    }
    getRoundById(id) {
        if (this.state.currentRound?.id === id) {
            return this.state.currentRound;
        }
        return this.state.rounds.find(r => r.id === id) || null;
    }
    // Bet operations
    placeBet(userId, roundId, amount, color) {
        if (!this.state.currentRound)
            return null;
        if (this.state.currentRound.phase !== 'BETTING')
            return null;
        if (this.state.currentRound.id !== roundId)
            return null;
        const user = this.state.users.get(userId);
        if (!user || user.balance < amount)
            return null;
        // Deduct balance
        user.balance -= amount;
        this.state.users.set(userId, user);
        const newBet = {
            id: (0, uuid_1.v4)(),
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
    updateBet(betId, userId, amount, color) {
        if (!this.state.currentRound)
            return null;
        if (this.state.currentRound.phase !== 'BETTING')
            return null;
        const betIndex = this.state.currentRound.bets.findIndex(b => b.id === betId && b.userId === userId);
        if (betIndex === -1)
            return null;
        const oldBet = this.state.currentRound.bets[betIndex];
        const user = this.state.users.get(userId);
        if (!user)
            return null;
        // Calculate balance difference
        const balanceDiff = amount - oldBet.amount;
        // Check if user has sufficient balance for the difference
        if (balanceDiff > 0 && user.balance < balanceDiff)
            return null;
        // Update user balance
        user.balance -= balanceDiff;
        this.state.users.set(userId, user);
        // Update bet
        const updatedBet = {
            ...oldBet,
            amount,
            color,
        };
        this.state.currentRound.bets[betIndex] = updatedBet;
        this.saveToFile();
        return updatedBet;
    }
    removeBet(betId, userId) {
        if (!this.state.currentRound)
            return false;
        if (this.state.currentRound.phase !== 'BETTING')
            return false;
        const betIndex = this.state.currentRound.bets.findIndex(b => b.id === betId && b.userId === userId);
        if (betIndex === -1)
            return false;
        const bet = this.state.currentRound.bets[betIndex];
        const user = this.state.users.get(userId);
        if (!user)
            return false;
        // Refund the bet amount
        user.balance += bet.amount;
        this.state.users.set(userId, user);
        // Remove bet
        this.state.currentRound.bets.splice(betIndex, 1);
        this.saveToFile();
        return true;
    }
    getUserBets(userId, limit = 10) {
        const allBets = [];
        if (this.state.currentRound) {
            const currentBets = this.state.currentRound.bets.filter(b => b.userId === userId);
            allBets.push(...currentBets);
        }
        for (const round of this.state.rounds.slice().reverse()) {
            const roundBets = round.bets.filter(b => b.userId === userId);
            allBets.push(...roundBets);
            if (allBets.length >= limit)
                break;
        }
        return allBets.slice(0, limit);
    }
    getUserBetForCurrentRound(userId) {
        if (!this.state.currentRound)
            return null;
        return this.state.currentRound.bets.find(b => b.userId === userId) || null;
    }
    getUserBetsForCurrentRound(userId) {
        if (!this.state.currentRound)
            return [];
        return this.state.currentRound.bets.filter(b => b.userId === userId);
    }
    getAllRecentBets(limit = 20) {
        const allBets = [];
        // Include bets from current round
        if (this.state.currentRound) {
            allBets.push(...this.state.currentRound.bets);
        }
        // Include bets from completed rounds
        for (const round of this.state.rounds.slice().reverse()) {
            allBets.push(...round.bets);
            if (allBets.length >= limit)
                break;
        }
        // Sort by creation time (newest first) and limit
        return allBets
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit);
    }
    getTopWinners(limit = 30) {
        const allBets = [];
        // Include winning bets from completed rounds only
        for (const round of this.state.rounds.slice().reverse()) {
            const winningBets = round.bets.filter(b => b.status === 'won');
            allBets.push(...winningBets);
        }
        // Sort by won amount (highest first) and limit
        return allBets
            .sort((a, b) => b.wonAmount - a.wonAmount)
            .slice(0, limit);
    }
    processRoundResults(winningColor, multipliers) {
        if (!this.state.currentRound)
            return;
        for (const bet of this.state.currentRound.bets) {
            if (bet.color === winningColor) {
                bet.status = 'won';
                bet.wonAmount = bet.amount * multipliers[winningColor];
                const user = this.state.users.get(bet.userId);
                if (user) {
                    user.balance += bet.wonAmount;
                    this.state.users.set(bet.userId, user);
                }
            }
            else {
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
exports.db = new Database();
//# sourceMappingURL=database.js.map