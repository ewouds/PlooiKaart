import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const SEED_USERS = [
  { displayName: 'Ewoud', username: 'ewoud', email: 'ewoud.smets@gmail.com', isPilot: false },
  { displayName: 'Tom', username: 'tom', email: 'tom@mail.com', isPilot: false },
  { displayName: 'Dave', username: 'dave', email: 'dave@mail.com', isPilot: false },
  { displayName: 'Birger', username: 'birger', email: 'birger@mail.com', isPilot: true },
  { displayName: 'Bert', username: 'bert', email: 'bert@mail.com', isPilot: false },
];

export async function seedUsers() {
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      await User.create(u);
      console.log(`Seeded user: ${u.username}`);
    } else {
      // Update fields if needed (e.g. isPilot)
      if (existing.isPilot !== u.isPilot || existing.email !== u.email) {
        existing.isPilot = u.isPilot;
        existing.email = u.email;
        await existing.save();
        console.log(`Updated user: ${u.username}`);
      }
    }
  }
}
