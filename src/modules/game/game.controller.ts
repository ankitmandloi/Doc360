import { Request, Response } from 'express';
import { gameService } from './game.service';

export const gameController = {
  getState: (req: Request, res: Response) => {
    try {
      const state = gameService.getGameState();
      
      if (!state) {
        return res.status(503).json({ 
          error: 'Game not initialized',
          message: 'Please wait for the game to start' 
        });
      }

      res.json({
        success: true,
        data: state,
      });
    } catch (error) {
      console.error('[GameController] getState error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getFairness: (req: Request, res: Response) => {
    try {
      const { roundId } = req.params;
      
      if (!roundId) {
        return res.status(400).json({ error: 'Round ID is required' });
      }

      const fairnessData = gameService.getFairnessData(roundId);
      
      if (!fairnessData) {
        return res.status(404).json({ error: 'Round not found' });
      }

      res.json({
        success: true,
        data: fairnessData,
      });
    } catch (error) {
      console.error('[GameController] getFairness error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getHistory: (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = gameService.getRoundHistory(limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('[GameController] getHistory error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getConfig: (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          multipliers: gameService.getMultipliers(),
          probabilities: gameService.getColorProbabilities(),
        },
      });
    } catch (error) {
      console.error('[GameController] getConfig error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

