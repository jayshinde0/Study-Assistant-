import Content from '../models/Content.js';
import Quiz from '../models/Quiz.js';
import Flashcard from '../models/Flashcard.js';
import ChatHistory from '../models/ChatHistory.js';
import { AppError } from '../middleware/errorHandler.js';

class SearchService {
  /**
   * Search across all user's study materials and data
   */
  async searchAll(userId, query, limit = 20) {
    try {
      if (!query || query.trim().length === 0) {
        throw new AppError('Search query is required', 400);
      }

      const searchQuery = query.trim().toLowerCase();
      const results = {
        contents: [],
        topics: [],
        flashcards: [],
        chatHistory: [],
        quizzes: []
      };

      // Search in contents (materials)
      const contents = await Content.find({
        userId,
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { originalText: { $regex: searchQuery, $options: 'i' } },
          { topics: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .select('_id title type topics createdAt')
        .limit(limit)
        .lean();

      results.contents = contents.map(c => ({
        id: c._id,
        title: c.title,
        type: c.type,
        topics: c.topics,
        createdAt: c.createdAt,
        resultType: 'content'
      }));

      // Extract and search topics
      const allTopics = new Set();
      contents.forEach(c => {
        if (c.topics) {
          c.topics.forEach(t => {
            if (t.toLowerCase().includes(searchQuery)) {
              allTopics.add(t);
            }
          });
        }
      });

      results.topics = Array.from(allTopics).slice(0, limit).map(topic => ({
        name: topic,
        resultType: 'topic'
      }));

      // Search in flashcards
      const flashcards = await Flashcard.find({
        userId,
        $or: [
          { front: { $regex: searchQuery, $options: 'i' } },
          { back: { $regex: searchQuery, $options: 'i' } },
          { topic: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .select('_id front back topic masteryLevel contentId')
        .limit(limit)
        .populate('contentId', 'title')
        .lean();

      results.flashcards = flashcards.map(f => ({
        id: f._id,
        front: f.front,
        back: f.back,
        topic: f.topic,
        masteryLevel: f.masteryLevel,
        contentTitle: f.contentId?.title,
        resultType: 'flashcard'
      }));

      // Search in chat history
      const chatSessions = await ChatHistory.find({
        userId,
        $or: [
          { 'messages.content': { $regex: searchQuery, $options: 'i' } },
          { topicsDiscussed: { $regex: searchQuery, $options: 'i' } },
          { sessionTitle: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .select('_id sessionTitle topicsDiscussed totalMessages createdAt')
        .limit(limit)
        .lean();

      results.chatHistory = chatSessions.map(c => ({
        id: c._id,
        title: c.sessionTitle,
        topics: c.topicsDiscussed,
        messageCount: c.totalMessages,
        createdAt: c.createdAt,
        resultType: 'chatSession'
      }));

      // Search in quizzes
      const quizzes = await Quiz.find({
        userId,
        $or: [
          { 'questions.topic': { $regex: searchQuery, $options: 'i' } },
          { 'questions.question': { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .select('_id score totalQuestions completedAt questions')
        .limit(limit)
        .lean();

      results.quizzes = quizzes.map(q => ({
        id: q._id,
        score: q.score,
        totalQuestions: q.totalQuestions,
        accuracy: Math.round((q.score / q.totalQuestions) * 100),
        completedAt: q.completedAt,
        resultType: 'quiz'
      }));

      return results;
    } catch (error) {
      console.error('Search error:', error.message);
      throw error;
    }
  }

  /**
   * Search only topics
   */
  async searchTopics(userId, query) {
    try {
      const searchQuery = query.trim().toLowerCase();

      const contents = await Content.find({
        userId,
        topics: { $regex: searchQuery, $options: 'i' }
      })
        .select('topics')
        .lean();

      const topicsSet = new Set();
      contents.forEach(c => {
        if (c.topics) {
          c.topics.forEach(t => {
            if (t.toLowerCase().includes(searchQuery)) {
              topicsSet.add(t);
            }
          });
        }
      });

      // Get performance data for each topic
      const quizzes = await Quiz.find({ userId }).lean();
      const topicStats = {};

      quizzes.forEach(quiz => {
        quiz.questions.forEach((q, idx) => {
          const topic = q.topic;
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].total += 1;
          if (quiz.userAnswers[idx]?.isCorrect) {
            topicStats[topic].correct += 1;
          }
        });
      });

      return Array.from(topicsSet).map(topic => ({
        name: topic,
        accuracy: topicStats[topic] 
          ? Math.round((topicStats[topic].correct / topicStats[topic].total) * 100)
          : 0,
        attempts: topicStats[topic]?.total || 0
      }));
    } catch (error) {
      console.error('Topic search error:', error.message);
      throw error;
    }
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(userId, limit = 10) {
    try {
      // Get recent contents
      const recentContents = await Content.find({ userId })
        .select('_id title type topics')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Get recent topics
      const allTopics = new Set();
      recentContents.forEach(c => {
        if (c.topics) {
          c.topics.forEach(t => allTopics.add(t));
        }
      });

      return {
        recentContents: recentContents.map(c => ({
          id: c._id,
          title: c.title,
          type: c.type,
          topics: c.topics,
          resultType: 'content'
        })),
        recentTopics: Array.from(allTopics).slice(0, 5).map(t => ({
          name: t,
          resultType: 'topic'
        }))
      };
    } catch (error) {
      console.error('Recent searches error:', error.message);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(userId, query) {
    try {
      const searchQuery = query.trim().toLowerCase();

      // Get content titles
      const contents = await Content.find({
        userId,
        title: { $regex: searchQuery, $options: 'i' }
      })
        .select('title')
        .limit(5)
        .lean();

      // Get topics
      const topicContents = await Content.find({
        userId,
        topics: { $regex: searchQuery, $options: 'i' }
      })
        .select('topics')
        .limit(5)
        .lean();

      const topicsSet = new Set();
      topicContents.forEach(c => {
        if (c.topics) {
          c.topics.forEach(t => {
            if (t.toLowerCase().includes(searchQuery)) {
              topicsSet.add(t);
            }
          });
        }
      });

      return {
        contentTitles: contents.map(c => c.title),
        topics: Array.from(topicsSet)
      };
    } catch (error) {
      console.error('Suggestions error:', error.message);
      throw error;
    }
  }
}

export default new SearchService();
