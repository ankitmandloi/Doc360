import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

// Authentication middleware - requires valid token
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
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
    
    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    
    // Attach user info to request
    req.userId = payload.userId;
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

// Optional authentication - doesn't require token but attaches user if present
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;
      
      if (token) {
        const payload = authService.verifyToken(token);
        if (payload) {
          req.userId = payload.userId;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

