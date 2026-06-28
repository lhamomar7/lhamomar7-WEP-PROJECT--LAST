import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true, enum: ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'] },
  date: { type: Date },
  start: { type: String, required: true },
  end: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ['draft','published','completed','cancelled'], default: 'published' },
  notes: { type: String, default: '' }
}, { timestamps: true });

shiftSchema.virtual('hours').get(function() {
  const [sh, sm] = this.start.split(':').map(Number);
  const [eh, em] = this.end.split(':').map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  return minutes > 0 ? minutes / 60 : 0;
});

shiftSchema.set('toJSON', { virtuals: true });
shiftSchema.set('toObject', { virtuals: true });

export default mongoose.model('Shift', shiftSchema);
