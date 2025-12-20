import { User } from '../../db/database';
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
declare class AuthService {
    private hashPassword;
    private verifyPassword;
    generateToken(userId: string, phone: string): string;
    verifyToken(token: string): TokenPayload | null;
    generateOTP(): string;
    sendOTP(phone: string): {
        success: boolean;
        message?: string;
        error?: string;
    };
    verifyOTP(phone: string, code: string): {
        success: boolean;
        error?: string;
    };
    register(phone: string, password: string, name?: string, referralCode?: string): AuthResponse;
    login(phone: string, password: string): AuthResponse;
    getUser(userId: string): Omit<User, 'password'> | null;
    getUserFromToken(token: string): Omit<User, 'password'> | null;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map