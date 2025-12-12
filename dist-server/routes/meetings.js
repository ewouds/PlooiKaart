import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuditEvent } from '../models/AuditEvent';
import { Meeting } from '../models/Meeting';
import { User } from '../models/User';
const router = express.Router();
router.post('/', authenticateToken, async (req, res) => {
    const { date, presentUserIds, excusedUserIds, topUps } = req.body;
    const userId = req.user?.userId;
    // 1. Validate Date is Thursday
    const d = new Date(date);
    if (d.getDay() !== 4) {
        return res.status(400).json({ message: 'Meetings must be on a Thursday' });
    }
    // 2. Validate Unique Date
    const existing = await Meeting.findOne({ date });
    if (existing) {
        return res.status(400).json({ message: 'A meeting for this date already exists' });
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
    // Create Meeting
    const meeting = await Meeting.create({
        date,
        presentUserIds,
        excusedUserIds,
        topUps,
        createdByUserId: userId,
    });
    // Calculate penalties for audit
    const allUsers = await User.find({});
    const penalizedUsers = allUsers.filter(u => !presentSet.has(u._id.toString()) && !excusedSet.has(u._id.toString()));
    const auditData = {
        meetingDate: date,
        penalizedUserIds: penalizedUsers.map(u => u._id),
        topUps: topUps
    };
    await AuditEvent.create({
        actorUserId: userId,
        type: 'MEETING_SUBMITTED',
        data: auditData
    });
    res.status(201).json(meeting);
});
export default router;
