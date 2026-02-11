import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import geminiService from './geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export class AnalyticsService {
  async getPerformance(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });
    
    const topicPerformance = {};
    quizzes.forEach(quiz => {
      quiz.userAnswers.forEach((answer, idx) => {
        const topic = quiz.questions[idx].topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        topicPerformance[topic].total += 1;
        if (answer.isCorrect) topicPerformance[topic].correct += 1;
      });
    });

    const topicStats = Object.entries(topicPerformance).map(([topic, stats]) => ({
      topic,
      accuracy: (stats.correct / stats.total) * 100,
      questionsAttempted: stats.total
    }));

    return {
      user: {
        xp: user.xp,
        streak: user.streak,
        totalQuizzesTaken: user.totalQuizzesTaken,
        averageAccuracy: user.averageAccuracy
      },
      topicStats,
      recentQuizzes: quizzes.slice(0, 5).map(q => ({
        id: q._id,
        accuracy: q.accuracy,
        difficulty: q.difficulty,
        completedAt: q.completedAt
      }))
    };
  }

  async getRecommendations(userId) {
    const performance = await this.getPerformance(userId);
    
    const weakTopics = performance.topicStats
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)
      .map(t => t.topic);

    if (weakTopics.length === 0) {
      return [{
        topic: 'Advanced Topics',
        action: 'Challenge yourself with harder quizzes',
        reason: 'You are performing well across all topics'
      }];
    }

    return await geminiService.generateRecommendations(weakTopics, performance);
  }

  async getProgressTrend(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const quizzes = await Quiz.find({
      userId,
      completedAt: { $gte: startDate }
    }).sort({ completedAt: 1 });

    const trend = {};
    quizzes.forEach(quiz => {
      const date = quiz.completedAt.toISOString().split('T')[0];
      if (!trend[date]) {
        trend[date] = { count: 0, totalAccuracy: 0 };
      }
      trend[date].count += 1;
      trend[date].totalAccuracy += quiz.accuracy;
    });

    return Object.entries(trend).map(([date, data]) => ({
      date,
      averageAccuracy: data.totalAccuracy / data.count,
      quizzesCompleted: data.count
    }));
  }
}

export default new AnalyticsService();
