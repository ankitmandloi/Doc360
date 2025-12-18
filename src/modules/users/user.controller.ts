import { Request, Response } from 'express';
import { userService } from './user.service';

export const userController = {
  // Get current user (from token)
  getCurrentUser: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const user = userService.getUser(userId);
      
      if (user) {
        return res.json({ success: true, data: user });
      } else {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('[Users] Get current user error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Get balance (from token)
  getBalance: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const user = userService.getUser(userId);
      
      if (user) {
        return res.json({ success: true, data: { balance: user.balance } });
      } else {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('[Users] Get balance error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Add balance (from token)
  addBalance: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const { amount } = req.body;
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }
      
      const user = userService.addBalance(userId, amount);
      
      if (user) {
        return res.json({
          success: true,
          data: { balance: user.balance, added: amount },
        });
      } else {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('[Users] Add balance error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Legacy: Get user by ID
  getUser: (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = userService.getUser(userId);
      
      if (user) {
        return res.json({ success: true, data: user });
      } else {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('[Users] Get user error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Legacy: Get balance by ID
  getBalanceById: (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = userService.getUser(userId);
      
      if (user) {
        return res.json({ success: true, data: { balance: user.balance } });
      } else {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('[Users] Get balance error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Legacy: Add balance by ID
  addBalanceById: (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }
      
      const user = userService.addBalance(userId, amount);
      
      if (user) {
        return res.json({
          success: true,
          data: { balance: user.balance, added: amount },
        });
      } else {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      console.error('[Users] Add balance error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};
