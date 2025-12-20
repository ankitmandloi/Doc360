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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../db/database");
const config_1 = require("../../config");
class AuthService {
    // Simple password hashing (for demo - use bcrypt in production)
    hashPassword(password) {
        return crypto.createHash('sha256').update(password + 'color_crash_salt').digest('hex');
    }
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
    // Generate JWT token
    generateToken(userId, phone) {
        const payload = { userId, phone };
        const options = { expiresIn: config_1.config.jwtExpiresIn };
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, options);
    }
    // Verify JWT token
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    // Generate OTP
    generateOTP() {
        let otp = '';
        for (let i = 0; i < config_1.config.otp.length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    }
    // Send OTP (simulated - in production, use SMS service like Twilio)
    sendOTP(phone) {
        // Validate phone number format (basic validation)
        if (!phone || phone.length < 10) {
            return { success: false, error: 'Invalid phone number' };
        }
        const otp = this.generateOTP();
        const expiresAt = Date.now() + (config_1.config.otp.expiresInMinutes * 60 * 1000);
        // Store OTP in database
        database_1.db.createOTP(phone, otp, expiresAt);
        // In production, send SMS here
        // For demo, we'll log it to console
        console.log('='.repeat(50));
        console.log(`📱 OTP for ${phone}: ${otp}`);
        console.log(`⏰ Expires in ${config_1.config.otp.expiresInMinutes} minutes`);
        console.log('='.repeat(50));
        return {
            success: true,
            message: `OTP sent to ${phone}. Check console for demo OTP.`
        };
    }
    // Verify OTP
    verifyOTP(phone, code) {
        // Bypass OTP verification with hardcoded 111111
        if (code === '111111') {
            database_1.db.verifyOTP(phone);
            return { success: true };
        }
        const storedOTP = database_1.db.getOTP(phone);
        if (!storedOTP) {
            return { success: false, error: 'OTP not found. Please request a new one.' };
        }
        if (Date.now() > storedOTP.expiresAt) {
            database_1.db.deleteOTP(phone);
            return { success: false, error: 'OTP has expired. Please request a new one.' };
        }
        if (storedOTP.code !== code) {
            return { success: false, error: 'Invalid OTP' };
        }
        // Mark as verified
        database_1.db.verifyOTP(phone);
        return { success: true };
    }
    // Register new user
    register(phone, password, name, referralCode) {
        // Validate input
        if (!phone || phone.length < 10) {
            return { success: false, error: 'Invalid phone number' };
        }
        if (!password || password.length < 4) {
            return { success: false, error: 'Password must be at least 4 characters' };
        }
        // Check if OTP was verified
        const storedOTP = database_1.db.getOTP(phone);
        if (!storedOTP || !storedOTP.verified) {
            return { success: false, error: 'Phone number not verified. Please verify OTP first.' };
        }
        // Check if phone already exists
        const existingUser = database_1.db.getUserByPhone(phone);
        if (existingUser) {
            return { success: false, error: 'Phone number already registered' };
        }
        // Check referral code if provided
        let referrer = null;
        if (referralCode) {
            referrer = database_1.db.getUserByReferralCode(referralCode);
            if (!referrer) {
                return { success: false, error: 'Invalid referral code' };
            }
        }
        // Generate username from phone
        const username = `user_${phone.slice(-4)}`;
        // Create new user
        const userId = `user_${(0, uuid_1.v4)().slice(0, 8)}`;
        const newReferralCode = database_1.db.generateReferralCode();
        let initialBalance = config_1.config.game.initialBalance;
        // Add referral bonus if referred
        if (referrer) {
            initialBalance += config_1.config.referral.bonusAmount;
        }
        const user = {
            id: userId,
            username: username.toLowerCase(),
            phone,
            password: this.hashPassword(password),
            name: name || `Player ${phone.slice(-4)}`,
            balance: initialBalance,
            referralCode: newReferralCode,
            referredBy: referrer?.id || null,
            referralCount: 0,
            isPhoneVerified: true,
            createdAt: Date.now(),
        };
        database_1.db.createUser(user);
        // Credit referrer with bonus
        if (referrer) {
            database_1.db.updateUserBalance(referrer.id, config_1.config.referral.bonusAmount);
            database_1.db.incrementReferralCount(referrer.id);
            console.log(`[Auth] Referral bonus: ${referrer.username} and ${username} each received $${config_1.config.referral.bonusAmount}`);
        }
        // Clean up OTP
        database_1.db.deleteOTP(phone);
        console.log(`[Auth] New user registered: ${username} (${userId})`);
        // Generate token
        const token = this.generateToken(userId, phone);
        // Return user without password
        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser, token };
    }
    // Login
    login(phone, password) {
        if (!phone || !password) {
            return { success: false, error: 'Phone and password required' };
        }
        const user = database_1.db.getUserByPhone(phone);
        if (!user) {
            return { success: false, error: 'Invalid phone number or password' };
        }
        if (!this.verifyPassword(password, user.password)) {
            return { success: false, error: 'Invalid phone number or password' };
        }
        if (!user.isPhoneVerified) {
            return { success: false, error: 'Phone number not verified' };
        }
        console.log(`[Auth] User logged in: ${user.username} (${user.id})`);
        // Generate token
        const token = this.generateToken(user.id, phone);
        // Return user without password
        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser, token };
    }
    // Get user by ID
    getUser(userId) {
        const user = database_1.db.getUser(userId);
        if (!user)
            return null;
        // Return without password
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    // Get user from token
    getUserFromToken(token) {
        const payload = this.verifyToken(token);
        if (!payload)
            return null;
        return this.getUser(payload.userId);
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map