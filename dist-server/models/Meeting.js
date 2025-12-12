import mongoose from 'mongoose';
const meetingSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    presentUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    excusedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    topUps: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number, required: true },
            comment: { type: String }
        }],
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export const Meeting = mongoose.model('Meeting', meetingSchema);
