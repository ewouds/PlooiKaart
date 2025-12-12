import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { calculateScores } from '../utils/scoring';
const router = express.Router();
router.get('/me', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user)
        return res.sendStatus(404);
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
export default router;
