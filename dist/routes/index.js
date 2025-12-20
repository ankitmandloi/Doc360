"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../modules/game/game.controller");
const bet_controller_1 = require("../modules/bets/bet.controller");
const user_controller_1 = require("../modules/users/user.controller");
const auth_controller_1 = require("../modules/auth/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Health check (public)
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
// ============== Auth routes (public) ==============
router.post('/auth/send-otp', auth_controller_1.authController.sendOTP);
router.post('/auth/verify-otp', auth_controller_1.authController.verifyOTP);
router.post('/auth/register', auth_controller_1.authController.register);
router.post('/auth/login', auth_controller_1.authController.login);
// ============== Auth routes (protected) ==============
router.get('/auth/profile', auth_middleware_1.requireAuth, auth_controller_1.authController.getProfile);
router.get('/auth/verify', auth_middleware_1.requireAuth, auth_controller_1.authController.verifyToken);
// ============== Game routes (public - for polling) ==============
router.get('/game/state', game_controller_1.gameController.getState);
router.get('/game/config', game_controller_1.gameController.getConfig);
router.get('/game/history', game_controller_1.gameController.getHistory);
router.get('/game/fairness/:roundId', game_controller_1.gameController.getFairness);
// ============== Bet routes (protected) ==============
router.post('/bets/place', auth_middleware_1.requireAuth, bet_controller_1.betController.placeBet);
router.put('/bets/update', auth_middleware_1.requireAuth, bet_controller_1.betController.updateBet);
router.delete('/bets/remove', auth_middleware_1.requireAuth, bet_controller_1.betController.removeBet);
router.get('/bets/all', bet_controller_1.betController.getAllBets);
router.get('/bets/winners', bet_controller_1.betController.getTopWinners);
router.get('/bets/user/history', auth_middleware_1.requireAuth, bet_controller_1.betController.getUserBets);
router.get('/bets/user/current', auth_middleware_1.requireAuth, bet_controller_1.betController.getCurrentBet);
router.get('/bets/user/current-all', auth_middleware_1.requireAuth, bet_controller_1.betController.getCurrentBets);
// ============== User routes (protected) ==============
router.get('/users/me', auth_middleware_1.requireAuth, user_controller_1.userController.getCurrentUser);
router.get('/users/me/balance', auth_middleware_1.requireAuth, user_controller_1.userController.getBalance);
router.post('/users/me/balance/add', auth_middleware_1.requireAuth, user_controller_1.userController.addBalance);
// Legacy routes (for backwards compatibility - will be deprecated)
router.get('/users/:userId', user_controller_1.userController.getUser);
router.get('/users/:userId/balance', user_controller_1.userController.getBalanceById);
router.post('/users/:userId/balance/add', user_controller_1.userController.addBalanceById);
exports.default = router;
//# sourceMappingURL=index.js.map