import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  front: { type: String, required: true }, // Question/Term
  back: { type: String, required: true }, // Answer/Definition
  topic: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  
  // Spaced repetition data
  masteryLevel: { type: Number, default: 0, min: 0, max: 5 }, // 0 = new, 5 = mastered
  lastReviewed: { type: Date },
  nextReview: { type: Date },
  reviewCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate next review date based on mastery level (spaced repetition)
flashcardSchema.methods.calculateNextReview = function() {
  const intervals = [1, 3, 7, 14, 30, 60]; // days
  const daysToAdd = intervals[this.masteryLevel] || 60;
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

export default mongoose.model('Flashcard', flashcardSchema);
