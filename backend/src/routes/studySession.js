import express from 'express';
import studySessionService from '../services/studySessionService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Start a study session
router.post('/start', authenticate, async (req, res, next) => {
  try {
    const { topic, duration, type } = req.body;
    if (!topic || !duration) {
      return res.status(400).json({ success: false, error: { message: 'Topic and duration are required' } });
    }
    const session = await studySessionService.startSession(req.userId, topic, duration, type);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// Complete a study session
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const session = await studySessionService.completeSession(req.userId, req.params.id);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// Get today's stats
router.get('/stats/today', authenticate, async (req, res, next) => {
  try {
    const stats = await studySessionService.getTodayStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Get weekly stats
router.get('/stats/weekly', authenticate, async (req, res, next) => {
  try {
    const stats = await studySessionService.getWeeklyStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Get available topics
router.get('/topics', authenticate, async (req, res, next) => {
  try {
    const topics = await studySessionService.getAvailableTopics(req.userId);
    res.json({ success: true, data: topics });
  } catch (error) {
    next(error);
  }
});

// Get recent sessions
router.get('/recent', authenticate, async (req, res, next) => {
  try {
    const sessions = await studySessionService.getRecentSessions(req.userId);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

export default router;
