import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Content from '../models/Content.js';
import StudySession from '../models/StudySession.js';
import { AppError } from '../middleware/errorHandler.js';

export class ComparisonService {
  async compareUsers(userId, targetUsername) {
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    // Find target user by username
    const targetUser = await User.findOne({ username: targetUsername.toLowerCase() });
    if (!targetUser) {
      throw new AppError(`User "${targetUsername}" not found`, 404);
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      throw new AppError('Cannot compare with yourself', 400);
    }

    // Get stats for both users
    const currentUserStats = await this.getUserStats(currentUser._id);
    const targetUserStats = await this.getUserStats(targetUser._id);

    // Get progress trend for both users
    const currentUserTrend = await this.getProgressTrend(currentUser._id);
    const targetUserTrend = await this.getProgressTrend(targetUser._id);

    // Get topic comparison
    const topicComparison = await this.compareTopics(currentUser._id, targetUser._id);

    return {
      currentUser: {
        id: currentUser._id,
        name: currentUser.name,
        username: currentUser.username,
        stats: currentUserStats,
        trend: currentUserTrend
      },
      targetUser: {
        id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        stats: targetUserStats,
        trend: targetUserTrend
      },
      topicComparison
    };
  }

  async getUserStats(userId) {
    const user = await User.findById(userId);
    const quizzes = await Quiz.find({ userId });
    const contents = await Content.find({ userId });

    const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
    const correctAnswers = quizzes.reduce((sum, quiz) => {
      return sum + quiz.userAnswers.filter(a => a.isCorrect).length;
    }, 0);

    // Get study time from Pomodoro sessions
    const studySessions = await StudySession.find({ 
      userId, 
      type: 'focus',
      completed: true 
    });
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

    return {
      xp: user.xp,
      streak: user.streak,
      totalQuizzes: user.totalQuizzesTaken,
      averageAccuracy: user.averageAccuracy,
      totalQuestions,
      correctAnswers,
      totalContent: contents.length,
      studyingSince: user.createdAt,
      totalStudyHours,
      totalStudyMinutes
    };
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

    // Get study sessions for the same period
    const studySessions = await StudySession.find({
      userId,
      createdAt: { $gte: startDate },
      type: 'focus',
      completed: true
    }).sort({ createdAt: 1 });

    studySessions.forEach(session => {
      const date = session.createdAt.toISOString().split('T')[0];
      if (!trend[date]) {
        trend[date] = { count: 0, totalAccuracy: 0, studyMinutes: 0 };
      }
      if (!trend[date].studyMinutes) {
        trend[date].studyMinutes = 0;
      }
      trend[date].studyMinutes += session.duration;
    });

    return Object.entries(trend).map(([date, data]) => ({
      date,
      averageAccuracy: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0,
      quizzesCompleted: data.count,
      studyHours: data.studyMinutes ? Math.round((data.studyMinutes / 60) * 10) / 10 : 0
    }));
  }

  async compareTopics(userId1, userId2) {
    const user1Quizzes = await Quiz.find({ userId: userId1 });
    const user2Quizzes = await Quiz.find({ userId: userId2 });

    // Calculate topic performance for user 1
    const user1Topics = {};
    user1Quizzes.forEach(quiz => {
      quiz.userAnswers.forEach((answer, idx) => {
        const topic = quiz.questions[idx]?.topic || 'General';
        if (!user1Topics[topic]) {
          user1Topics[topic] = { correct: 0, total: 0 };
        }
        user1Topics[topic].total += 1;
        if (answer.isCorrect) user1Topics[topic].correct += 1;
      });
    });

    // Calculate topic performance for user 2
    const user2Topics = {};
    user2Quizzes.forEach(quiz => {
      quiz.userAnswers.forEach((answer, idx) => {
        const topic = quiz.questions[idx]?.topic || 'General';
        if (!user2Topics[topic]) {
          user2Topics[topic] = { correct: 0, total: 0 };
        }
        user2Topics[topic].total += 1;
        if (answer.isCorrect) user2Topics[topic].correct += 1;
      });
    });

    // Combine all topics
    const allTopics = new Set([...Object.keys(user1Topics), ...Object.keys(user2Topics)]);

    return Array.from(allTopics).map(topic => {
      const user1Data = user1Topics[topic];
      const user2Data = user2Topics[topic];

      return {
        topic,
        user1Accuracy: user1Data ? Math.round((user1Data.correct / user1Data.total) * 100) : 0,
        user2Accuracy: user2Data ? Math.round((user2Data.correct / user2Data.total) * 100) : 0,
        user1Attempts: user1Data?.total || 0,
        user2Attempts: user2Data?.total || 0
      };
    }).sort((a, b) => {
      // Sort by total attempts (most practiced topics first)
      return (b.user1Attempts + b.user2Attempts) - (a.user1Attempts + a.user2Attempts);
    });
  }

  async searchUsers(query) {
    // Search by username or name
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name username xp totalQuizzesTaken averageAccuracy')
    .limit(10);

    return users.map(user => ({
      id: user._id,
      name: user.name,
      username: user.username || 'No username set',
      xp: user.xp,
      totalQuizzes: user.totalQuizzesTaken,
      averageAccuracy: user.averageAccuracy
    }));
  }

  async updateUsername(userId, newUsername) {
    // Check if username is already taken
    const existing = await User.findOne({ 
      username: newUsername.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existing) {
      throw new AppError('Username already taken', 400);
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      throw new AppError('Username must be 3-20 characters and contain only letters, numbers, and underscores', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username: newUsername.toLowerCase() },
      { new: true }
    ).select('-password');

    return user;
  }
}

export default new ComparisonService();
