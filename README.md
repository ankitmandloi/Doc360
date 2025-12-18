# Color Crash Backend

Production-grade backend for the Color Crash betting game.

## Features

- **Game Engine**: Autonomous round scheduling with deterministic outcomes
- **Real-time Updates**: WebSocket for live game state synchronization
- **Fair Algorithm**: Cryptographically secure random outcome generation
- **Persistent Storage**: File-based database with automatic persistence
- **RESTful API**: Complete API for game state, bets, and users

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The server will start at:
- HTTP: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

## Game Timings

| Phase | Duration |
|-------|----------|
| Initialization | 15 seconds |
| Betting | 30 seconds |
| Winning | 30 seconds |
| **Total Round** | **75 seconds** |

## API Endpoints

### Game

```
GET /api/game/state        - Get current game state
GET /api/game/config       - Get multipliers and probabilities
GET /api/game/history      - Get past rounds
GET /api/game/fairness/:id - Get fairness data for a round
```

### Bets

```
POST /api/bets/place                - Place a bet
GET  /api/bets/user/:userId/history - Get user's bet history
GET  /api/bets/user/:userId/current - Get user's current round bet
```

### Users

```
GET  /api/users/:userId          - Get user info
GET  /api/users/:userId/balance  - Get user balance
POST /api/users/:userId/balance/add - Add balance (deposit)
```

## WebSocket Events

### Client -> Server

```json
{ "type": "auth", "payload": { "userId": "user_default" } }
{ "type": "ping" }
```

### Server -> Client

```json
{ "type": "connected", "payload": { "message": "..." } }
{ "type": "round:update", "payload": { ... } }
{ "type": "timer:update", "payload": { ... } }
{ "type": "winner:reveal", "payload": { ... } }
{ "type": "bet:confirmed", "payload": { ... } }
```

## Fairness

The game uses a provably fair algorithm:

1. Server generates a random seed at round start
2. Seed hash is published (can be verified later)
3. Winner determined using: `crypto.createHash('sha256').update(seed + timestamp).digest()`
4. After round completion, full seed is revealed for verification

### Color Distribution

| Color | Range | Probability | Multiplier |
|-------|-------|-------------|------------|
| Red   | 0-49  | 50%         | x2         |
| Green | 50-79 | 30%         | x3         |
| Blue  | 80-99 | 20%         | x5         |

## Architecture

```
/src
  /config          - Configuration
  /db              - In-memory database with file persistence
  /events          - WebSocket gateway
  /modules
    /game          - Game engine, scheduler, fairness
    /bets          - Betting logic
    /users         - User management
  /routes          - Express routes
  index.ts         - Entry point
```

## Environment Variables

```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret
ROUND_INIT_DURATION=15
ROUND_BETTING_DURATION=30
ROUND_WINNING_DURATION=30
FRONTEND_URL=http://localhost:3000
```

