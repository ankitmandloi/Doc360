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

  updateBet: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const { betId, color, amount } = req.body;
      
      if (!betId || !color || !amount) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const result = betService.updateBet(betId, userId, color, amount);
      
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
      console.error('[Bets] Update bet error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  removeBet: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const { betId } = req.body;
      
      if (!betId) {
        return res.status(400).json({ success: false, error: 'Missing betId' });
      }

      const result = betService.removeBet(betId, userId);
      
      if (result.success) {
        return res.json({ success: true });
      } else {
        return res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('[Bets] Remove bet error:', error);
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

  getCurrentBets: (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      const bets = betService.getUserBetsForCurrentRound(userId);
      
      return res.json({ success: true, data: bets });
    } catch (error) {
      console.error('[Bets] Get current bets error:', error);
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

  getTopWinners: (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const bets = betService.getTopWinners(limit);
      
      return res.json({ success: true, data: bets });
    } catch (error) {
      console.error('[Bets] Get top winners error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};
