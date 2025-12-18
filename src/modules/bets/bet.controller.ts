import { Request, Response } from 'express';
import { betService, placeBetSchema } from './bet.service';

export const betController = {
  placeBet: (req: Request, res: Response) => {
    try {
      // Get userId from authenticated request
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const { color, amount } = req.body;
      
      // Validate input
      const validation = placeBetSchema.safeParse({ userId, color, amount });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0]?.message || 'Invalid input',
        });
      }

      const result = betService.placeBet(validation.data);
      
      if (result.success) {
        return res.json({
          success: true,
          data: {
            bet: result.bet,
            potentialWin: result.potentialWin,
          },
        });
      } else {
        return res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('[Bets] Place bet error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getUserBets: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const bets = betService.getUserBets(userId, limit);
      
      return res.json({ success: true, data: bets });
    } catch (error) {
      console.error('[Bets] Get user bets error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getCurrentBet: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const bet = betService.getUserBetForCurrentRound(userId);
      
      return res.json({ success: true, data: bet });
    } catch (error) {
      console.error('[Bets] Get current bet error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  getAllBets: (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const bets = betService.getAllRecentBets(limit);
      
      return res.json({ success: true, data: bets });
    } catch (error) {
      console.error('[Bets] Get all bets error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};
