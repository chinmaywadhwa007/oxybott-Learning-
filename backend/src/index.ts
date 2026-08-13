import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import { authRouter } from './routes/authRoutes.js';
import { arduinoRouter } from './routes/arduinoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, cURL, Postman)
      if (!origin) return callback(null, true);
      // Allow localhost frontend origins and configured FRONTEND_URL
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'Oxybott Backend' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/arduino', arduinoRouter);

// Global Error & Process Resilience Handlers for Production
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [BACKEND UNHANDLED REJECTION]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ [BACKEND UNCAUGHT EXCEPTION]:', err);
});

async function startServer() {
  // Initialize Database Tables
  await initDatabase();

  // Start Server
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 [AUTH BACKEND] Server running on http://localhost:${PORT}`);
    console.log(`👉 API Healthcheck: http://localhost:${PORT}/api/health\n`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('\n🛑 [AUTH BACKEND] Shutting down gracefully...');
    server.close(() => {
      console.log('✅ HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
