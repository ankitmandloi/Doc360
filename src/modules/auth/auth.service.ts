import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { db, User } from '../../db/database';
import { config } from '../../config';

export interface TokenPayload {
  userId: string;
  phone: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: Omit<User, 'password'>;
  token?: string;
  error?: string;
}

class AuthService {
  // Simple password hashing (for demo - use bcrypt in production)
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'color_crash_salt').digest('hex');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Generate JWT token
  generateToken(userId: string, phone: string): string {
    const payload: TokenPayload = { userId, phone };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  }

  // Verify JWT token
  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Generate OTP
  generateOTP(): string {
    let otp = '';
    for (let i = 0; i < config.otp.length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  // Send OTP (simulated - in production, use SMS service like Twilio)
  sendOTP(phone: string): { success: boolean; message?: string; error?: string } {
    // Validate phone number format (basic validation)
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Invalid phone number' };
    }

    const otp = this.generateOTP();
    const expiresAt = Date.now() + (config.otp.expiresInMinutes * 60 * 1000);
    
    // Store OTP in database
    db.createOTP(phone, otp, expiresAt);
    
    // In production, send SMS here
    // For demo, we'll log it to console
    console.log('='.repeat(50));
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log(`⏰ Expires in ${config.otp.expiresInMinutes} minutes`);
    console.log('='.repeat(50));
    
    return { 
      success: true, 
      message: `OTP sent to ${phone}. Check console for demo OTP.` 
    };
  }

  // Verify OTP
  verifyOTP(phone: string, code: string): { success: boolean; error?: string } {
    const storedOTP = db.getOTP(phone);
    
    if (!storedOTP) {
      return { success: false, error: 'OTP not found. Please request a new one.' };
    }
    
    if (Date.now() > storedOTP.expiresAt) {
      db.deleteOTP(phone);
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }
    
    if (storedOTP.code !== code) {
      return { success: false, error: 'Invalid OTP' };
    }
    
    // Mark as verified
    db.verifyOTP(phone);
    
    return { success: true };
  }

  // Register new user
  register(
    phone: string, 
    password: string, 
    name?: string,
    referralCode?: string
  ): AuthResponse {
    // Validate input
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Invalid phone number' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    // Check if OTP was verified
    const storedOTP = db.getOTP(phone);
    if (!storedOTP || !storedOTP.verified) {
      return { success: false, error: 'Phone number not verified. Please verify OTP first.' };
    }

    // Check if phone already exists
    const existingUser = db.getUserByPhone(phone);
    if (existingUser) {
      return { success: false, error: 'Phone number already registered' };
    }

    // Check referral code if provided
    let referrer: User | null = null;
    if (referralCode) {
      referrer = db.getUserByReferralCode(referralCode);
      if (!referrer) {
        return { success: false, error: 'Invalid referral code' };
      }
    }

    // Generate username from phone
    const username = `user_${phone.slice(-4)}`;
    
    // Create new user
    const userId = `user_${uuidv4().slice(0, 8)}`;
    const newReferralCode = db.generateReferralCode();
    
    let initialBalance = config.game.initialBalance;
    
    // Add referral bonus if referred
    if (referrer) {
      initialBalance += config.referral.bonusAmount;
    }
    
    const user: User = {
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

    db.createUser(user);
    
    // Credit referrer with bonus
    if (referrer) {
      db.updateUserBalance(referrer.id, config.referral.bonusAmount);
      db.incrementReferralCount(referrer.id);
      console.log(`[Auth] Referral bonus: ${referrer.username} and ${username} each received $${config.referral.bonusAmount}`);
    }
    
    // Clean up OTP
    db.deleteOTP(phone);
    
    console.log(`[Auth] New user registered: ${username} (${userId})`);

    // Generate token
    const token = this.generateToken(userId, phone);

    // Return user without password
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser as Omit<User, 'password'>, token };
  }

  // Login
  login(phone: string, password: string): AuthResponse {
    if (!phone || !password) {
      return { success: false, error: 'Phone and password required' };
    }

    const user = db.getUserByPhone(phone);
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
    return { success: true, user: safeUser as Omit<User, 'password'>, token };
  }

  // Get user by ID
  getUser(userId: string): Omit<User, 'password'> | null {
    const user = db.getUser(userId);
    if (!user) return null;
    
    // Return without password
    const { password: _, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  // Get user from token
  getUserFromToken(token: string): Omit<User, 'password'> | null {
    const payload = this.verifyToken(token);
    if (!payload) return null;
    
    return this.getUser(payload.userId);
  }
}

export const authService = new AuthService();
