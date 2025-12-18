import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from './config';
import routes from './routes';
import { gameScheduler } from './modules/game/game.scheduler';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for LAN access
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

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
gameScheduler.start();

// Start server
server.listen(config.port, config.host, () => {
  console.log('='.repeat(50));
  console.log(`🎮 Color Crash Backend Server v2.0`);
  console.log('='.repeat(50));
  console.log(`📡 HTTP Server: http://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`⏱️  Round Duration: ${config.game.totalDuration / 1000}s`);
  console.log(`🎁 Referral Bonus: $${config.referral.bonusAmount}`);
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
  gameScheduler.stop();
  server.close(() => {
    console.log('[Server] Goodbye!');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] Shutting down...');
  gameScheduler.stop();
  server.close(() => {
    console.log('[Server] Goodbye!');
    process.exit(0);
  });
});
