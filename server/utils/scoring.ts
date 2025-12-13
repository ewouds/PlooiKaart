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

export async function calculateScoreHistory() {
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const users = await User.find({});
  const meetings = await Meeting.find({
    date: { $gte: startOfYear, $lte: endOfYear }
  }).sort({ date: 1 });

  // Initialize current scores
  const userScores = new Map<string, number>();
  users.forEach(user => {
    let score = 5;
    if (user.isPilot) score += 5;
    userScores.set(user._id.toString(), score);
  });

  // Initial data point (start of year)
  const history = [{
    date: startOfYear,
    scores: users.map(u => ({
      userId: u._id.toString(),
      name: u.username,
      score: userScores.get(u._id.toString()) || 0
    }))
  }];

  for (const meeting of meetings) {
    // Update scores based on this meeting
    users.forEach(user => {
      const userId = user._id.toString();
      let currentScore = userScores.get(userId) || 0;

      const isPresent = meeting.presentUserIds.some(id => id.toString() === userId);
      const isExcused = meeting.excusedUserIds.some(id => id.toString() === userId);

      if (!isPresent && !isExcused) {
        currentScore -= 1;
      }

      const userTopUps = meeting.topUps.filter(t => t.userId?.toString() === userId);
      for (const t of userTopUps) {
        currentScore += t.amount;
      }

      userScores.set(userId, currentScore);
    });

    // Add data point for this meeting date
    history.push({
      date: meeting.date,
      scores: users.map(u => ({
        userId: u._id.toString(),
        name: u.username,
        score: userScores.get(u._id.toString()) || 0
      }))
    });
  }

  return history;
}
