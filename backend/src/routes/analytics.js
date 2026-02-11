import express from 'express';
import analyticsService from '../services/analyticsService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/performance', authenticate, async (req, res, next) => {
  try {
    const performance = await analyticsService.getPerformance(req.userId);
    res.json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations', authenticate, async (req, res, next) => {
  try {
    const recommendations = await analyticsService.getRecommendations(req.userId);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
});

router.get('/topic-mastery', authenticate, async (req, res, next) => {
  try {
    const mastery = await analyticsService.getTopicMastery(req.userId);
    res.json({ success: true, data: mastery });
  } catch (error) {
    next(error);
  }
});

router.get('/trend', authenticate, async (req, res, next) => {
  try {
    const days = req.query.days || 30;
    const trend = await analyticsService.getProgressTrend(req.userId, parseInt(days));
    res.json({ success: true, data: trend });
  } catch (error) {
    next(error);
  }
});

export default router;
