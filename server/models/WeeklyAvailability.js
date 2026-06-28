import mongoose from 'mongoose';

// One WeeklyAvailability document represents a single employee's full
// week submission: free-text availability notes for all 7 days at once,
// rather than 7 separate constraint documents.
const dayNoteSchema = new mongoose.Schema({
  day: { type: String, required: true },     // e.g. 'ראשון'
  note: { type: String, default: '' }        // free text, e.g. "פנוי כל היום" / "לא פנוי בבוקר"
}, { _id: false });

const weeklyAvailabilitySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week: { type: mongoose.Schema.Types.ObjectId, ref: 'WeekPeriod', required: true },
  days: { type: [dayNoteSchema], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  managerNote: { type: String, default: '' }
}, { timestamps: true });

// One submission per employee per week — resubmitting updates it (upsert)
// rather than creating duplicates.
weeklyAvailabilitySchema.index({ employee: 1, week: 1 }, { unique: true });

export default mongoose.model('WeeklyAvailability', weeklyAvailabilitySchema);
