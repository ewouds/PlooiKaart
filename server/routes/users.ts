import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { calculateScoreHistory, calculateScores } from '../utils/scoring';

const router = express.Router();

// Public endpoint for login dropdown
router.get('/login-list', async (req, res) => {
  const users = await User.find({}).select('displayName username profilePicture');
  res.json(users);
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user?.userId).select('-passwordHash');
  if (!user) return res.sendStatus(404);
  
  // Calculate my score specifically? Or just return user info?
  // The dashboard needs the score. Let's return the score in /me or just use /scores.
  // Let's return basic info here.
  res.json(user);
});

router.get('/scores', authenticateToken, async (req, res) => {
  const scores = await calculateScores();
  // Sort by score descending? Requirements say "leaderboard".
  scores.sort((a, b) => b.score - a.score);
  res.json(scores);
});

router.get('/scores/history', authenticateToken, async (req, res) => {
  const history = await calculateScoreHistory();
  res.json(history);
});

router.patch('/me/theme', authenticateToken, async (req: AuthRequest, res) => {
  const { theme } = req.body;
  if (!['light', 'dark'].includes(theme)) {
    return res.status(400).json({ message: 'Invalid theme' });
  }

  const user = await User.findByIdAndUpdate(
    req.user?.userId,
    { theme },
    { new: true }
  ).select('-passwordHash');

  res.json(user);
});

router.patch('/me', authenticateToken, async (req: AuthRequest, res) => {
  const { displayName, profilePicture } = req.body;
  
  if (!displayName) {
    return res.status(400).json({ message: 'Display name is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { displayName, profilePicture },
      { new: true }
    ).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router;
