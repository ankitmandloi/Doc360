"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const game_scheduler_1 = require("./modules/game/game.scheduler");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: true, // Allow all origins for LAN access
    credentials: true,
}));
app.use(express_1.default.json());
// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api', routes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Color Crash Backend',
        version: '2.0.0',
        status: 'running',
        features: [
            'REST API (polling-based)',
            'JWT Authentication',
            'OTP Phone Verification',
            'Referral System',
        ],
    });
});
// Start game scheduler
game_scheduler_1.gameScheduler.start();
// Start server
server.listen(config_1.config.port, config_1.config.host, () => {
    console.log('='.repeat(50));
    console.log(`🎮 Color Crash Backend Server v2.0`);
    console.log('='.repeat(50));
    console.log(`📡 HTTP Server: http://${config_1.config.host}:${config_1.config.port}`);
    console.log(`🌍 Environment: ${config_1.config.nodeEnv}`);
    console.log(`⏱️  Round Duration: ${config_1.config.game.totalDuration / 1000}s`);
    console.log(`🎁 Referral Bonus: $${config_1.config.referral.bonusAmount}`);
    console.log(`🌐 LAN Access: Use your PC's IP address`);
    console.log('='.repeat(50));
    console.log('📱 Authentication: JWT Token-based');
    console.log('📲 OTP: Check console for demo OTP codes');
    console.log('🔄 Game State: Poll /api/game/state');
    console.log('='.repeat(50));
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Server] Shutting down...');
    game_scheduler_1.gameScheduler.stop();
    server.close(() => {
        console.log('[Server] Goodbye!');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('[Server] Shutting down...');
    game_scheduler_1.gameScheduler.stop();
    server.close(() => {
        console.log('[Server] Goodbye!');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map