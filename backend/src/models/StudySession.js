import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  type: { type: String, enum: ['focus', 'break'], default: 'focus' },
  completed: { type: Boolean, default: false },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ userId: 1, topic: 1 });

export default mongoose.model('StudySession', studySessionSchema);
