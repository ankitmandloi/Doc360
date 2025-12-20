import { Router } from 'express';
import { gameController } from '../modules/game/game.controller';
import { betController } from '../modules/bets/bet.controller';
import { userController } from '../modules/users/user.controller';
import { authController } from '../modules/auth/auth.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Health check (public)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ============== Auth routes (public) ==============
router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// ============== Auth routes (protected) ==============
router.get('/auth/profile', requireAuth, authController.getProfile);
router.get('/auth/verify', requireAuth, authController.verifyToken);

// ============== Game routes (public - for polling) ==============
router.get('/game/state', gameController.getState);
router.get('/game/config', gameController.getConfig);
router.get('/game/history', gameController.getHistory);
router.get('/game/fairness/:roundId', gameController.getFairness);

// ============== Bet routes (protected) ==============
router.post('/bets/place', requireAuth, betController.placeBet);
router.put('/bets/update', requireAuth, betController.updateBet);
router.delete('/bets/remove', requireAuth, betController.removeBet);
router.get('/bets/all', betController.getAllBets);
router.get('/bets/user/history', requireAuth, betController.getUserBets);
router.get('/bets/user/current', requireAuth, betController.getCurrentBet);
router.get('/bets/user/current-all', requireAuth, betController.getCurrentBets);

// ============== User routes (protected) ==============
router.get('/users/me', requireAuth, userController.getCurrentUser);
router.get('/users/me/balance', requireAuth, userController.getBalance);
router.post('/users/me/balance/add', requireAuth, userController.addBalance);

// Legacy routes (for backwards compatibility - will be deprecated)
router.get('/users/:userId', userController.getUser);
router.get('/users/:userId/balance', userController.getBalanceById);
router.post('/users/:userId/balance/add', userController.addBalanceById);

export default router;
