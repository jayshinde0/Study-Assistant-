import express from 'express';
import learningPathService from '../services/learningPathService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's learning path
router.get('/', authenticate, async (req, res, next) => {
  try {
    const path = await learningPathService.generateLearningPath(req.userId);
    res.json({ success: true, data: path });
  } catch (error) {
    next(error);
  }
});

// Get details for a specific topic
router.get('/topic/:topic', authenticate, async (req, res, next) => {
  try {
    const details = await learningPathService.getTopicDetails(req.userId, req.params.topic);
    res.json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
});

export default router;
