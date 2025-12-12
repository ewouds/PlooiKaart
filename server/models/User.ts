import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  isPilot: { type: Boolean, default: false },
  passwordHash: { type: String },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
