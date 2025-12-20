"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = void 0;
const auth_service_1 = require("../modules/auth/auth.service");
// Authentication middleware - requires valid token
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'No authorization header' });
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const payload = auth_service_1.authService.verifyToken(token);
        if (!payload) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
        // Attach user info to request
        req.userId = payload.userId;
        next();
    }
    catch (error) {
        console.error('[Auth Middleware] Error:', error);
        return res.status(401).json({ success: false, error: 'Authentication failed' });
    }
};
exports.requireAuth = requireAuth;
// Optional authentication - doesn't require token but attaches user if present
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;
            if (token) {
                const payload = auth_service_1.authService.verifyToken(token);
                if (payload) {
                    req.userId = payload.userId;
                }
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map