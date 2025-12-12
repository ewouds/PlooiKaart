import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuditEvent } from '../models/AuditEvent';

const router = express.Router();

const EXCLUDED_EVENT_TYPES = [
  'PASSWORD_RESET_COMPLETED',
  'PASSWORD_RESET_REQUESTED'
];

router.get('/', authenticateToken, async (req, res) => {
  const events = await AuditEvent.find({ type: { $nin: EXCLUDED_EVENT_TYPES } })
    .populate('actorUserId', 'displayName username')
    .sort({ timestamp: -1 }); // Newest first
  res.json(events);
});

export default router;
