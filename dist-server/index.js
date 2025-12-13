// server/index.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv2 from "dotenv";
import express5 from "express";
import mongoose5 from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// server/routes/audit.ts
import express from "express";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// server/models/AuditEvent.ts
import mongoose from "mongoose";
var auditEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }
});
var AuditEvent = mongoose.model("AuditEvent", auditEventSchema);

// server/routes/audit.ts
var router = express.Router();
var EXCLUDED_EVENT_TYPES = [
  "PASSWORD_RESET_COMPLETED",
  "PASSWORD_RESET_REQUESTED"
];
router.get("/", authenticateToken, async (req, res) => {
  const events = await AuditEvent.find({ type: { $nin: EXCLUDED_EVENT_TYPES } }).populate("actorUserId", "displayName username").sort({ timestamp: -1 });
  res.json(events);
});
var audit_default = router;

// server/routes/auth.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import express2 from "express";
import jwt2 from "jsonwebtoken";

// server/models/PasswordResetToken.ts
import mongoose2 from "mongoose";
var passwordResetTokenSchema = new mongoose2.Schema({
  userId: { type: mongoose2.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date }
}, { timestamps: true });
var PasswordResetToken = mongoose2.model("PasswordResetToken", passwordResetTokenSchema);

// server/models/User.ts
import mongoose3 from "mongoose";
var userSchema = new mongoose3.Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  isPilot: { type: Boolean, default: false },
  passwordHash: { type: String }
}, { timestamps: true });
var User = mongoose3.model("User", userSchema);

// server/utils/email.ts
import nodemailer from "nodemailer";
var transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}
async function sendPasswordResetEmail(to, resetLink) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("================================================");
    console.log("SMTP not configured. Password reset link:");
    console.log(resetLink);
    console.log("================================================");
    return;
  }
  const info = await getTransporter().sendMail({
    from: `"PlooiKaart" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link below to reset your password:

${resetLink}

If you did not request this, please ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
  console.log("Message sent: %s", info.messageId);
}

// server/routes/auth.ts
var router2 = express2.Router();
router2.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt2.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1e3 });
  res.json({ message: "Logged in" });
});
router2.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});
router2.post("/password-reset/request", async (req, res) => {
  const { identifier } = req.body;
  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
  if (!user) {
    return res.json({ message: "If the user exists, a reset link has been sent." });
  }
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 36e5);
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt
  });
  await AuditEvent.create({
    actorUserId: user._id,
    type: "PASSWORD_RESET_REQUESTED",
    data: { email: user.email }
  });
  const resetLink = `${process.env.PUBLIC_URL}/reset-password?token=${token}&id=${user._id}`;
  try {
    await sendPasswordResetEmail(user.email, resetLink);
  } catch (error) {
    console.error("Error sending email:", error);
  }
  res.json({ message: "If the user exists, a reset link has been sent." });
});
router2.post("/password-reset/confirm", async (req, res) => {
  const { userId, token, newPassword } = req.body;
  console.log(`[DEBUG] Reset confirm for user: ${userId}`);
  const resetTokens = await PasswordResetToken.find({
    userId,
    expiresAt: { $gt: /* @__PURE__ */ new Date() },
    usedAt: null
  });
  if (resetTokens.length === 0) {
    console.log("[DEBUG] No valid reset token found in DB (or expired/used)");
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  let validResetTokenDoc = null;
  for (const doc of resetTokens) {
    const isValid = await bcrypt.compare(token, doc.tokenHash);
    if (isValid) {
      validResetTokenDoc = doc;
      break;
    }
  }
  if (!validResetTokenDoc) {
    console.log("[DEBUG] Token hash mismatch (checked against " + resetTokens.length + " valid tokens)");
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { passwordHash });
  validResetTokenDoc.usedAt = /* @__PURE__ */ new Date();
  await validResetTokenDoc.save();
  await AuditEvent.create({
    actorUserId: userId,
    type: "PASSWORD_RESET_COMPLETED"
  });
  res.json({ message: "Password updated successfully" });
});
var auth_default = router2;

// server/routes/meetings.ts
import express3 from "express";

// server/models/Meeting.ts
import mongoose4 from "mongoose";
var meetingSchema = new mongoose4.Schema({
  date: { type: String, required: true, unique: true },
  // YYYY-MM-DD
  presentUserIds: [{ type: mongoose4.Schema.Types.ObjectId, ref: "User" }],
  excusedUserIds: [{ type: mongoose4.Schema.Types.ObjectId, ref: "User" }],
  topUps: [{
    userId: { type: mongoose4.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    comment: { type: String }
  }],
  createdByUserId: { type: mongoose4.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
var Meeting = mongoose4.model("Meeting", meetingSchema);

// server/routes/meetings.ts
var router3 = express3.Router();
router3.post("/", authenticateToken, async (req, res) => {
  const { date, presentUserIds, excusedUserIds, topUps } = req.body;
  const userId = req.user?.userId;
  const d = new Date(date);
  if (d.getDay() !== 4) {
    return res.status(400).json({ message: "Meetings must be on a Thursday" });
  }
  const existing = await Meeting.findOne({ date });
  if (existing) {
    return res.status(400).json({ message: "A meeting for this date already exists" });
  }
  const presentSet = new Set(presentUserIds);
  const excusedSet = new Set(excusedUserIds);
  for (const id of presentSet) {
    if (excusedSet.has(id)) {
      return res.status(400).json({ message: "A user cannot be both present and excused" });
    }
  }
  if (topUps && Array.isArray(topUps)) {
    for (const t of topUps) {
      if (!Number.isInteger(t.amount) || t.amount <= 0 || t.amount % 5 !== 0) {
        return res.status(400).json({ message: "Top-up amount must be a positive multiple of 5" });
      }
    }
  }
  const meeting = await Meeting.create({
    date,
    presentUserIds,
    excusedUserIds,
    topUps,
    createdByUserId: userId
  });
  const allUsers = await User.find({});
  const penalizedUsers = allUsers.filter(
    (u) => !presentSet.has(u._id.toString()) && !excusedSet.has(u._id.toString())
  );
  const auditData = {
    meetingDate: date,
    penalizedUserIds: penalizedUsers.map((u) => u._id),
    topUps
  };
  await AuditEvent.create({
    actorUserId: userId,
    type: "MEETING_SUBMITTED",
    data: auditData
  });
  res.status(201).json(meeting);
});
var meetings_default = router3;

// server/routes/users.ts
import express4 from "express";

// server/utils/scoring.ts
async function calculateScores() {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;
  const users = await User.find({});
  const meetings = await Meeting.find({
    date: { $gte: startOfYear, $lte: endOfYear }
  });
  const scores = users.map((user) => {
    let score = 5;
    if (user.isPilot) score += 5;
    let penalties = 0;
    let topUps = 0;
    for (const meeting of meetings) {
      const isPresent = meeting.presentUserIds.some((id) => id.toString() === user._id.toString());
      const isExcused = meeting.excusedUserIds.some((id) => id.toString() === user._id.toString());
      if (!isPresent && !isExcused) {
        penalties += 1;
      }
      const userTopUps = meeting.topUps.filter((t) => t.userId?.toString() === user._id.toString());
      for (const t of userTopUps) {
        topUps += t.amount;
      }
    }
    score = score + topUps - penalties;
    return {
      ...user.toObject(),
      score
    };
  });
  return scores;
}

// server/routes/users.ts
var router4 = express4.Router();
router4.get("/me", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user?.userId).select("-passwordHash");
  if (!user) return res.sendStatus(404);
  res.json(user);
});
router4.get("/scores", authenticateToken, async (req, res) => {
  const scores = await calculateScores();
  scores.sort((a, b) => b.score - a.score);
  res.json(scores);
});
var users_default = router4;

// server/seed.ts
import dotenv from "dotenv";
dotenv.config();
var SEED_USERS = [
  { displayName: "Ewoud", username: "ewoud", email: "ewoud.smets@gmail.com", isPilot: false },
  { displayName: "Tom", username: "tom", email: "tom.vanrossom@gmail.com", isPilot: false },
  { displayName: "Dave", username: "dave", email: "davedekaey@gmail.com", isPilot: false },
  { displayName: "Birger", username: "birger", email: "birger.vandenbrande@gmail.com", isPilot: true },
  { displayName: "Bert", username: "bert", email: "bgossey@hotmail.com", isPilot: false }
];
async function seedUsers() {
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      await User.create(u);
      console.log(`Seeded user: ${u.username}`);
    } else {
      if (existing.isPilot !== u.isPilot || existing.email !== u.email) {
        existing.isPilot = u.isPilot;
        existing.email = u.email;
        await existing.save();
        console.log(`Updated user: ${u.username}`);
      }
    }
  }
}

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv2.config();
var app = express5();
var PORT = process.env.PORT || 3e3;
var allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.PUBLIC_URL
].filter(Boolean);
console.log("Allowed CORS origins:", allowedOrigins);
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express5.json());
app.use(cookieParser());
app.use("/auth", auth_default);
app.use("/meetings", meetings_default);
app.use("/audit", audit_default);
app.use("/users", users_default);
app.use(express5.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
mongoose5.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB");
  await seedUsers();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => console.error("MongoDB connection error:", err));
