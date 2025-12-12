import { Meeting } from '../models/Meeting';
import { User } from '../models/User';

export async function calculateScores() {
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const users = await User.find({});
  const meetings = await Meeting.find({
    date: { $gte: startOfYear, $lte: endOfYear }
  });

  const scores = users.map(user => {
    let score = 5;
    if (user.isPilot) score += 5;

    let penalties = 0;
    let topUps = 0;

    for (const meeting of meetings) {
      const isPresent = meeting.presentUserIds.some(id => id.toString() === user._id.toString());
      const isExcused = meeting.excusedUserIds.some(id => id.toString() === user._id.toString());

      if (!isPresent && !isExcused) {
        penalties += 1;
      }

      const userTopUps = meeting.topUps.filter(t => t.userId?.toString() === user._id.toString());
      for (const t of userTopUps) {
        topUps += t.amount;
      }
    }

    score = score + topUps - penalties;

    return {
      ...user.toObject(),
      score,
    };
  });

  return scores;
}
