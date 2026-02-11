import Quiz from '../models/Quiz.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import geminiService from './geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export class QuizService {
  async generateQuiz(userId, contentId, difficulty = 'medium') {
    const content = await Content.findById(contentId);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    const questions = await geminiService.generateQuiz(content.originalText, difficulty, 5);
    
    const quiz = new Quiz({
      userId,
      contentId,
      difficulty,
      questions: questions.map((q, idx) => ({
        id: `q${idx}`,
        question: q.question,
        type: 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: content.topics[idx % content.topics.length] || 'General'
      }))
    });

    await quiz.save();
    return quiz;
  }

  async submitQuiz(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.userId.toString() !== userId) {
      throw new AppError('Quiz not found', 404);
    }

    let correctCount = 0;
    quiz.userAnswers = answers.map((answer, idx) => {
      const question = quiz.questions[idx];
      const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();
      if (isCorrect) correctCount++;
      return { questionId: question.id, answer, isCorrect, timeSpent: 0 };
    });

    quiz.score = correctCount;
    quiz.accuracy = (correctCount / quiz.questions.length) * 100;
    quiz.completedAt = new Date();

    await quiz.save();

    // Update user stats
    const user = await User.findById(userId);
    user.totalQuizzesTaken += 1;
    user.averageAccuracy = ((user.averageAccuracy * (user.totalQuizzesTaken - 1)) + quiz.accuracy) / user.totalQuizzesTaken;
    user.xp += Math.floor(quiz.accuracy / 10);
    await user.save();

    return quiz;
  }

  async getAdaptiveDifficulty(userId, contentId) {
    const recentQuizzes = await Quiz.find({ userId, contentId }).sort({ createdAt: -1 }).limit(3);
    
    if (recentQuizzes.length === 0) return 'easy';

    const avgAccuracy = recentQuizzes.reduce((sum, q) => sum + q.accuracy, 0) / recentQuizzes.length;

    if (avgAccuracy > 80) return 'hard';
    if (avgAccuracy < 50) return 'easy';
    return 'medium';
  }

  async getQuizHistory(userId) {
    return Quiz.find({ userId }).populate('contentId').sort({ createdAt: -1 });
  }
}

export default new QuizService();
