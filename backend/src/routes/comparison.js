import express from 'express';
import comparisonService from '../services/comparisonService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Compare with another user
router.post('/compare', authenticate, async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: { message: 'Username is required' } });
    }
    const comparison = await comparisonService.compareUsers(req.userId, username);
    res.json({ success: true, data: comparison });
  } catch (error) {
    next(error);
  }
});

// Search users
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    const users = await comparisonService.searchUsers(q);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// Update own username
router.put('/username', authenticate, async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: { message: 'Username is required' } });
    }
    const user = await comparisonService.updateUsername(req.userId, username);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
