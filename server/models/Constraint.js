import mongoose from 'mongoose';

const constraintSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week: { type: mongoose.Schema.Types.ObjectId, ref: 'WeekPeriod', required: true },
  day: { type: String, required: true },
  preferredStart: { type: String, required: true },
  preferredEnd: { type: String, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  managerNote: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Constraint', constraintSchema);
