"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
exports.authController = {
    // Send OTP to phone number
    sendOTP: (req, res) => {
        try {
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ success: false, error: 'Phone number is required' });
            }
            const result = auth_service_1.authService.sendOTP(phone);
            if (result.success) {
                return res.json({ success: true, message: result.message });
            }
            else {
                return res.status(400).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Auth] Send OTP error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    // Verify OTP
    verifyOTP: (req, res) => {
        try {
            const { phone, otp } = req.body;
            if (!phone || !otp) {
                return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
            }
            const result = auth_service_1.authService.verifyOTP(phone, otp);
            if (result.success) {
                return res.json({ success: true, message: 'OTP verified successfully' });
            }
            else {
                return res.status(400).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Auth] Verify OTP error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    // Register new user
    register: (req, res) => {
        try {
            const { phone, password, name, referralCode } = req.body;
            const result = auth_service_1.authService.register(phone, password, name, referralCode);
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.user,
                    token: result.token,
                });
            }
            else {
                return res.status(400).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Auth] Register error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    // Login
    login: (req, res) => {
        try {
            const { phone, password } = req.body;
            const result = auth_service_1.authService.login(phone, password);
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.user,
                    token: result.token,
                });
            }
            else {
                return res.status(401).json({ success: false, error: result.error });
            }
        }
        catch (error) {
            console.error('[Auth] Login error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    // Get profile (protected route)
    getProfile: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const user = auth_service_1.authService.getUser(userId);
            if (user) {
                return res.json({ success: true, data: user });
            }
            else {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
        }
        catch (error) {
            console.error('[Auth] Get profile error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
    // Verify token
    verifyToken: (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Invalid token' });
            }
            const user = auth_service_1.authService.getUser(userId);
            if (user) {
                return res.json({ success: true, data: user });
            }
            else {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
        }
        catch (error) {
            console.error('[Auth] Verify token error:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=auth.controller.js.map