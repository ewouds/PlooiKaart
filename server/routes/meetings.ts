import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AuditEvent } from '../models/AuditEvent';
import { Meeting } from '../models/Meeting';
import { User } from '../models/User';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const meetings = await Meeting.find({}, 'date');
  res.json(meetings);
});

router.get('/:date', authenticateToken, async (req, res) => {
  const { date } = req.params;
  const meeting = await Meeting.findOne({ date });
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }
  res.json(meeting);
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const { date, presentUserIds, excusedUserIds, topUps, overwrite } = req.body;
  console.log(`Creating meeting for date: ${date} (overwrite: ${overwrite})`);
  const userId = req.user?.userId;

  // 2. Validate Unique Date
  let meeting = await Meeting.findOne({ date });
  if (meeting) {
    if (!overwrite) {
      return res.status(409).json({ code: 'MEETING_EXISTS', message: 'A meeting for this date already exists' });
    }
    // If overwrite is true, we proceed to update the existing meeting
  }

  // 3. Validate Disjoint
  const presentSet = new Set(presentUserIds);
  const excusedSet = new Set(excusedUserIds);
  for (const id of presentSet) {
    if (excusedSet.has(id)) {
      return res.status(400).json({ message: 'A user cannot be both present and excused' });
    }
  }

  // 4. Validate TopUps
  if (topUps && Array.isArray(topUps)) {
    for (const t of topUps) {
      if (!Number.isInteger(t.amount) || t.amount <= 0 || t.amount % 5 !== 0) {
        return res.status(400).json({ message: 'Top-up amount must be a positive multiple of 5' });
      }
    }
  }

  // Create or Update Meeting
  if (meeting) {
    // Update existing
    meeting.presentUserIds = presentUserIds;
    meeting.excusedUserIds = excusedUserIds;
    meeting.topUps = topUps;
    // We keep the original createdByUserId or update it? Usually keep original creator, but maybe track last modifier.
    // For now, let's just update the fields.
    await meeting.save();
  } else {
    // Create new
    meeting = await Meeting.create({
      date,
      presentUserIds,
      excusedUserIds,
      topUps,
      createdByUserId: userId,
    });
  }

  // Calculate penalties for audit
  const allUsers = await User.find({});
  const penalizedUsers = allUsers.filter(u => 
    !presentSet.has(u._id.toString()) && !excusedSet.has(u._id.toString())
  );

  const auditData: any = {
    meetingDate: date,
    penalizedUserIds: penalizedUsers.map(u => u._id),
    topUps: topUps
  };

  await AuditEvent.create({
    actorUserId: userId,
    type: overwrite ? 'MEETING_OVERWRITTEN' : 'MEETING_SUBMITTED',
    data: auditData
  });

  res.status(meeting.isNew ? 201 : 200).json(meeting);
});

export default router;
