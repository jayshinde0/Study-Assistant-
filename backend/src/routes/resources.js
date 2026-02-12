import express from 'express';
import { authenticate } from '../middleware/auth.js';
import externalResourceService from '../services/externalResourceService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/resources/topic/:topic
 * Get learning resources for a specific topic
 */
router.get('/topic/:topic', authenticate, async (req, res, next) => {
  try {
    const { topic } = req.params;

    if (!topic || topic.trim().length === 0) {
      throw new AppError('Topic is required', 400);
    }

    console.log(`📚 Fetching resources for topic: ${topic}`);

    // First try to get curated resources
    let resources = externalResourceService.getCuratedResources(topic);

    // If no curated resources, fetch from external sources
    if (!resources) {
      resources = await externalResourceService.getResourcesForTopic(topic);
    }

    res.status(200).json({
      success: true,
      data: {
        topic,
        resources,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resources/videos/:topic
 * Get YouTube videos for a topic
 */
router.get('/videos/:topic', authenticate, async (req, res, next) => {
  try {
    const { topic } = req.params;

    if (!topic || topic.trim().length === 0) {
      throw new AppError('Topic is required', 400);
    }

    const videos = await externalResourceService.fetchYouTubeVideos(topic);

    res.status(200).json({
      success: true,
      data: {
        topic,
        videos,
        count: videos.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resources/articles/:topic
 * Get articles for a topic
 */
router.get('/articles/:topic', authenticate, async (req, res, next) => {
  try {
    const { topic } = req.params;

    if (!topic || topic.trim().length === 0) {
      throw new AppError('Topic is required', 400);
    }

    const articles = await externalResourceService.fetchArticles(topic);

    res.status(200).json({
      success: true,
      data: {
        topic,
        articles,
        count: articles.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resources/courses/:topic
 * Get courses for a topic
 */
router.get('/courses/:topic', authenticate, async (req, res, next) => {
  try {
    const { topic } = req.params;

    if (!topic || topic.trim().length === 0) {
      throw new AppError('Topic is required', 400);
    }

    const courses = await externalResourceService.fetchCourses(topic);

    res.status(200).json({
      success: true,
      data: {
        topic,
        courses,
        count: courses.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
