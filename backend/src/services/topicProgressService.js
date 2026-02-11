import UserTopicProgress from '../models/UserTopicProgress.js';
import { AppError } from '../middleware/errorHandler.js';

export class TopicProgressService {
  async updateTopicProgress(userId, topic, isCorrect) {
    let progress = await UserTopicProgress.findOne({ userId, topic });

    if (!progress) {
      progress = new UserTopicProgress({
        userId,
        topic,
        attempts: 1,
        correctAnswers: isCorrect ? 1 : 0
      });
    } else {
      progress.attempts += 1;
      if (isCorrect) progress.correctAnswers += 1;
    }

    // Calculate accuracy
    progress.accuracy = (progress.correctAnswers / progress.attempts) * 100;

    // Determine mastery level
    if (progress.accuracy < 50) {
      progress.masteryLevel = 'weak';
      progress.nextRevisionDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // +1 day
    } else if (progress.accuracy <= 80) {
      progress.masteryLevel = 'medium';
      progress.nextRevisionDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // +3 days
    } else {
      progress.masteryLevel = 'strong';
      progress.nextRevisionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days
    }

    progress.lastPracticed = new Date();
    progress.updatedAt = new Date();

    await progress.save();
    
    console.log(`✅ Topic Progress Updated: ${topic}`);
    console.log(`   Attempts: ${progress.attempts}, Correct: ${progress.correctAnswers}, Accuracy: ${progress.accuracy.toFixed(1)}%, Level: ${progress.masteryLevel}`);
    
    return progress;
  }

  async getWeakTopics(userId) {
    return UserTopicProgress.find({
      userId,
      masteryLevel: 'weak'
    }).sort({ accuracy: 1 });
  }

  async getStrongTopics(userId) {
    return UserTopicProgress.find({
      userId,
      masteryLevel: 'strong'
    }).sort({ accuracy: -1 });
  }

  async getRevisionTopics(userId) {
    const now = new Date();
    return UserTopicProgress.find({
      userId,
      nextRevisionDate: { $lte: now }
    }).sort({ nextRevisionDate: 1 });
  }

  async getUserTopicStats(userId) {
    const stats = await UserTopicProgress.find({ userId });
    
    const weakTopics = stats.filter(s => s.masteryLevel === 'weak');
    const mediumTopics = stats.filter(s => s.masteryLevel === 'medium');
    const strongTopics = stats.filter(s => s.masteryLevel === 'strong');

    return {
      totalTopics: stats.length,
      weakTopics: weakTopics.map(t => ({ topic: t.topic, accuracy: t.accuracy })),
      mediumTopics: mediumTopics.map(t => ({ topic: t.topic, accuracy: t.accuracy })),
      strongTopics: strongTopics.map(t => ({ topic: t.topic, accuracy: t.accuracy })),
      revisionDue: await this.getRevisionTopics(userId)
    };
  }
}

export default new TopicProgressService();
