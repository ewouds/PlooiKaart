import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
});

export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
