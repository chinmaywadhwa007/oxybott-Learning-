import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../db/database.js';
import { sendMagicLinkEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const authRouter = Router();

const jwtSecret = process.env.JWT_SECRET || 'oxybott_super_secret_jwt_key_2026_change_in_production';

function generateToken(user: { id: string; email: string; username: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

// -------------------------------------------------------------
// 1. REGISTER USER
// -------------------------------------------------------------
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, name, password } = req.body;

    if (!email || !username || !name || !password) {
      return res.status(400).json({ error: 'All fields (email, username, name, password) are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    const existingUser = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [cleanEmail, cleanUsername]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = randomUUID();

    await db.run(
      `INSERT INTO users (id, email, username, name, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [userId, cleanEmail, cleanUsername, name.trim(), passwordHash]
    );

    const user = { id: userId, email: cleanEmail, username: cleanUsername, name: name.trim() };
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (err: any) {
    console.error('[Auth Route] Register Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// 2. LOGIN WITH PASSWORD
// -------------------------------------------------------------
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required.' });
    }

    const queryTarget = emailOrUsername.toLowerCase().trim();
    const user = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [queryTarget, queryTarget]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (err: any) {
    console.error('[Auth Route] Login Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// 3. MAGIC LINK REQUEST (PASSWORDLESS AUTH)
// -------------------------------------------------------------
authRouter.post('/magic-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const magicLinkId = randomUUID();

    await db.run(
      `INSERT INTO magic_links (id, email, token, expires_at) VALUES (?, ?, ?, ?)`,
      [magicLinkId, cleanEmail, token, expiresAt]
    );

    await sendMagicLinkEmail(cleanEmail, token);

    return res.status(200).json({
      message: 'Magic link has been generated and sent to your email!',
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error('[Auth Route] Magic Link Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// 4. VERIFY MAGIC LINK TOKEN
// -------------------------------------------------------------
authRouter.post('/magic-link/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Magic link token is required.' });
    }

    const magicLink = await db.get(
      'SELECT * FROM magic_links WHERE token = ? AND used = 0',
      [token]
    );

    if (!magicLink) {
      return res.status(400).json({ error: 'Invalid or already used magic link.' });
    }

    if (new Date(magicLink.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Magic link has expired. Please request a new one.' });
    }

    await db.run('UPDATE magic_links SET used = 1 WHERE id = ?', [magicLink.id]);

    let user = await db.get('SELECT * FROM users WHERE email = ?', [magicLink.email]);

    if (!user) {
      const userId = randomUUID();
      const derivedName = magicLink.email.split('@')[0];
      const derivedUsername = `${derivedName}_${Math.floor(1000 + Math.random() * 9000)}`;

      await db.run(
        `INSERT INTO users (id, email, username, name) VALUES (?, ?, ?, ?)`,
        [userId, magicLink.email, derivedUsername, derivedName]
      );

      user = { id: userId, email: magicLink.email, username: derivedUsername, name: derivedName };
    }

    const jwtToken = generateToken(user);

    return res.status(200).json({
      message: 'Magic link verified successfully!',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (err: any) {
    console.error('[Auth Route] Verify Magic Link Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// 5. FORGOT PASSWORD REQUEST
// -------------------------------------------------------------
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });

    const cleanEmail = email.toLowerCase().trim();
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await db.run(
      `INSERT INTO password_resets (id, email, token, expires_at) VALUES (?, ?, ?, ?)`,
      [randomUUID(), cleanEmail, token, expiresAt]
    );

    await sendPasswordResetEmail(cleanEmail, token);

    return res.status(200).json({ message: 'If an account exists, a password reset link has been sent.' });
  } catch (err: any) {
    console.error('[Auth Route] Forgot Password Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// 6. RESET PASSWORD COMPLETION
// -------------------------------------------------------------
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required.' });

    const resetReq = await db.get(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0',
      [token]
    );
    if (!resetReq || new Date(resetReq.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, resetReq.email]);
    await db.run('UPDATE password_resets SET used = 1 WHERE id = ?', [resetReq.id]);

    return res.status(200).json({ message: 'Password has been successfully updated!' });
  } catch (err: any) {
    console.error('[Auth Route] Reset Password Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// 7. GET CURRENT USER PROFILE
// -------------------------------------------------------------
authRouter.get('/me', async (req: Request, res: Response) => {
  return res.status(200).json({
    user: {
      id: 'guest-user-1',
      email: 'guest@oxybott.local',
      username: 'Guest Developer',
      name: 'Guest Developer',
    },
  });
});
