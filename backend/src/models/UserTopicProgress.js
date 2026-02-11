import mongoose from 'mongoose';

const userTopicProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  masteryLevel: { type: String, enum: ['weak', 'medium', 'strong'], default: 'weak' },
  lastPracticed: { type: Date },
  nextRevisionDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
userTopicProgressSchema.index({ userId: 1, topic: 1 }, { unique: true });
userTopicProgressSchema.index({ userId: 1, masteryLevel: 1 });
userTopicProgressSchema.index({ userId: 1, nextRevisionDate: 1 });

export default mongoose.model('UserTopicProgress', userTopicProgressSchema);
