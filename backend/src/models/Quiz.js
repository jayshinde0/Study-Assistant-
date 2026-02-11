import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [{
    id: String,
    question: String,
    type: { type: String, enum: ['mcq', 'short-answer'] },
    options: [String],
    correctAnswer: String,
    explanation: String,
    topic: String
  }],
  userAnswers: [{
    questionId: String,
    answer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  score: Number,
  accuracy: Number,
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Quiz', quizSchema);
