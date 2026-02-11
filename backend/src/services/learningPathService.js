import Content from '../models/Content.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export class LearningPathService {
  async generateLearningPath(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get all user's content and extract topics
    const contents = await Content.find({ userId });
    const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });

    // Extract all unique topics
    const allTopics = new Set();
    contents.forEach(content => {
      if (content.topics) {
        content.topics.forEach(topic => allTopics.add(topic));
      }
    });

    // Calculate mastery level for each topic
    const topicMastery = {};
    quizzes.forEach(quiz => {
      quiz.userAnswers.forEach((answer, idx) => {
        const topic = quiz.questions[idx]?.topic || 'General';
        if (!topicMastery[topic]) {
          topicMastery[topic] = { correct: 0, total: 0, attempts: 0 };
        }
        topicMastery[topic].total += 1;
        topicMastery[topic].attempts += 1;
        if (answer.isCorrect) {
          topicMastery[topic].correct += 1;
        }
      });
    });

    // Build learning path with status
    const learningPath = Array.from(allTopics).map(topic => {
      const mastery = topicMastery[topic];
      let status = 'not-started';
      let accuracy = 0;
      let level = 'beginner';

      if (mastery) {
        accuracy = (mastery.correct / mastery.total) * 100;
        
        if (accuracy >= 90) {
          status = 'mastered';
          level = 'expert';
        } else if (accuracy >= 70) {
          status = 'in-progress';
          level = 'intermediate';
        } else if (mastery.attempts > 0) {
          status = 'struggling';
          level = 'beginner';
        }
      }

      return {
        topic,
        status,
        level,
        accuracy: Math.round(accuracy),
        attempts: mastery?.attempts || 0,
        prerequisites: this.getPrerequisites(topic),
        recommended: status === 'not-started' || status === 'struggling'
      };
    });

    // Sort by recommended learning order
    const sortedPath = this.sortByLearningOrder(learningPath);

    return {
      totalTopics: sortedPath.length,
      masteredTopics: sortedPath.filter(t => t.status === 'mastered').length,
      inProgressTopics: sortedPath.filter(t => t.status === 'in-progress').length,
      notStartedTopics: sortedPath.filter(t => t.status === 'not-started').length,
      strugglingTopics: sortedPath.filter(t => t.status === 'struggling').length,
      path: sortedPath,
      nextRecommended: sortedPath.find(t => t.recommended) || null
    };
  }

  getPrerequisites(topic) {
    // Define prerequisite relationships
    const prerequisites = {
      // Math topics
      'Algebra': [],
      'Calculus': ['Algebra'],
      'Differential Equations': ['Calculus'],
      'Linear Algebra': ['Algebra'],
      'Statistics': ['Algebra'],
      
      // Science topics
      'Chemistry': ['Atoms', 'Elements'],
      'Organic Chemistry': ['Chemistry'],
      'Physics': ['Algebra'],
      'Quantum Physics': ['Physics', 'Calculus'],
      'Thermodynamics': ['Physics'],
      
      // Biology topics
      'Cell Biology': [],
      'Genetics': ['Cell Biology'],
      'Evolution': ['Genetics'],
      'Ecology': ['Cell Biology'],
      'Molecular Biology': ['Cell Biology', 'Chemistry'],
      
      // Computer Science topics
      'Programming': [],
      'Data Structures': ['Programming'],
      'Algorithms': ['Data Structures'],
      'Machine Learning': ['Algorithms', 'Statistics'],
      'Neural Networks': ['Machine Learning'],
      
      // Default
      'default': []
    };

    return prerequisites[topic] || [];
  }

  sortByLearningOrder(path) {
    // Sort by:
    // 1. Topics with no prerequisites first
    // 2. Topics that are struggling (need review)
    // 3. Topics not started
    // 4. Topics in progress
    // 5. Mastered topics last

    return path.sort((a, b) => {
      // Prioritize struggling topics
      if (a.status === 'struggling' && b.status !== 'struggling') return -1;
      if (b.status === 'struggling' && a.status !== 'struggling') return 1;

      // Then not-started topics
      if (a.status === 'not-started' && b.status !== 'not-started') return -1;
      if (b.status === 'not-started' && a.status !== 'not-started') return 1;

      // Then in-progress
      if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
      if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;

      // Topics with fewer prerequisites come first
      if (a.prerequisites.length !== b.prerequisites.length) {
        return a.prerequisites.length - b.prerequisites.length;
      }

      // Finally by accuracy (lower accuracy first for review)
      return a.accuracy - b.accuracy;
    });
  }

  async getTopicDetails(userId, topic) {
    // Get all content related to this topic
    const contents = await Content.find({
      userId,
      topics: topic
    });

    // Get quiz performance for this topic
    const quizzes = await Quiz.find({ userId });
    const topicQuestions = [];
    
    quizzes.forEach(quiz => {
      quiz.questions.forEach((question, idx) => {
        if (question.topic === topic) {
          topicQuestions.push({
            question: question.question,
            isCorrect: quiz.userAnswers[idx]?.isCorrect || false,
            quizId: quiz._id,
            completedAt: quiz.completedAt
          });
        }
      });
    });

    const correctAnswers = topicQuestions.filter(q => q.isCorrect).length;
    const accuracy = topicQuestions.length > 0 
      ? (correctAnswers / topicQuestions.length) * 100 
      : 0;

    return {
      topic,
      accuracy: Math.round(accuracy),
      totalQuestions: topicQuestions.length,
      correctAnswers,
      relatedContent: contents.map(c => ({
        id: c._id,
        title: c.title,
        type: c.type
      })),
      recentQuestions: topicQuestions.slice(-5)
    };
  }
}

export default new LearningPathService();
