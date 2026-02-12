import express from 'express';
import { authenticate } from '../middleware/auth.js';
import searchService from '../services/searchService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/search
 * Search across all user's study materials
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;
    const userId = req.userId;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const results = await searchService.searchAll(userId, q, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        query: q,
        results,
        totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/topics
 * Search only topics
 */
router.get('/topics', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.userId;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const topics = await searchService.searchTopics(userId, q);

    res.status(200).json({
      success: true,
      data: {
        query: q,
        topics,
        count: topics.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions
 */
router.get('/suggestions', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.userId;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          recent: await searchService.getRecentSearches(userId)
        }
      });
    }

    const suggestions = await searchService.getSearchSuggestions(userId, q);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/recent
 * Get recent searches
 */
router.get('/recent', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;

    const recent = await searchService.getRecentSearches(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: recent
    });
  } catch (error) {
    next(error);
  }
});

export default router;
