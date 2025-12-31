import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuditEvent } from '../models/AuditEvent';

const router = express.Router();

const EXCLUDED_EVENT_TYPES = [
  'PASSWORD_RESET_COMPLETED',
  'PASSWORD_RESET_REQUESTED',
  'USER_LOGIN'
];

router.get('/', authenticateToken, async (req, res) => {
  const { date } = req.query;
  
  const query: any = { type: { $nin: EXCLUDED_EVENT_TYPES } };
  
  // If date filter is provided, filter by the event date (data.meetingDate)
  if (date && typeof date === 'string') {
    query['data.meetingDate'] = date;
  }
  
  const events = await AuditEvent.find(query)
    .populate('actorUserId', 'displayName username profilePicture')
    .sort({ timestamp: -1 }); // Newest first
  res.json(events);
});

export default router;
