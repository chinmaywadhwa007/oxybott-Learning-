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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

async function startServer() {
  // Initialize Database Tables
  await initDatabase();

  // Start Server
  app.listen(PORT, () => {
    console.log(`\n🚀 [AUTH BACKEND] Server running on http://localhost:${PORT}`);
    console.log(`👉 API Healthcheck: http://localhost:${PORT}/api/health\n`);
  });
}

startServer();
