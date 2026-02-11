import express from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

router.post('/youtube', authenticate, async (req, res, next) => {
  try {
    const { url, title } = req.body;
    if (!url) {
      throw new AppError('Missing URL', 400);
    }

    // In production, use YouTube API to extract transcript
    const summary = await geminiService.generateSummary(
      `YouTube video: ${title || url}. Please provide a summary of what this video likely covers based on the URL.`,
      'detailed'
    );

    res.json({ success: true, data: { url, title, summary } });
  } catch (error) {
    next(error);
  }
});

router.post('/web', authenticate, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      throw new AppError('Missing URL', 400);
    }

    // In production, use web scraping to extract content
    const summary = await geminiService.generateSummary(
      `Web article from ${url}. Please provide a summary of what this article likely covers.`,
      'detailed'
    );

    res.json({ success: true, data: { url, summary } });
  } catch (error) {
    next(error);
  }
});

export default router;
