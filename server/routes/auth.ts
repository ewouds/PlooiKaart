import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import { AuditEvent } from '../models/AuditEvent';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { User } from '../models/User';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  
  res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
  res.json({ message: 'Logged in' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.post('/password-reset/request', async (req, res) => {
  const { identifier } = req.body; // username or email
  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

  // Always return success to avoid enumeration
  if (!user) {
    return res.json({ message: 'If the user exists, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  await AuditEvent.create({
    actorUserId: user._id,
    type: 'PASSWORD_RESET_REQUESTED',
    data: { email: user.email }
  });

  const resetLink = `${process.env.PUBLIC_URL}/reset-password?token=${token}&id=${user._id}`;
  console.log(`[DEV-MODE] Password reset link for ${user.username}: ${resetLink}`);

  res.json({ message: 'If the user exists, a reset link has been sent.' });
});

router.post('/password-reset/confirm', async (req, res) => {
  const { userId, token, newPassword } = req.body;

  const resetToken = await PasswordResetToken.findOne({
    userId,
    expiresAt: { $gt: new Date() },
    usedAt: null,
  });

  if (!resetToken) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const validToken = await bcrypt.compare(token, resetToken.tokenHash);
  if (!validToken) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { passwordHash });

  resetToken.usedAt = new Date();
  await resetToken.save();

  await AuditEvent.create({
    actorUserId: userId,
    type: 'PASSWORD_RESET_COMPLETED',
  });

  res.json({ message: 'Password updated successfully' });
});

export default router;
