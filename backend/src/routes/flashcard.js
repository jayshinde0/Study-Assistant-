import express from 'express';
import flashcardService from '../services/flashcardService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate flashcards from content
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { contentId, count } = req.body;
    if (!contentId) {
      return res.status(400).json({ success: false, error: { message: 'Content ID is required' } });
    }
    const flashcards = await flashcardService.generateFlashcards(req.userId, contentId, count || 10);
    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// Get all flashcards (optionally filtered by content)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { contentId } = req.query;
    const flashcards = await flashcardService.getFlashcards(req.userId, contentId);
    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// Get flashcards due for review
router.get('/due', authenticate, async (req, res, next) => {
  try {
    const flashcards = await flashcardService.getDueFlashcards(req.userId);
    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// Review a flashcard (mark as known/unknown)
router.post('/:id/review', authenticate, async (req, res, next) => {
  try {
    const { known } = req.body;
    if (typeof known !== 'boolean') {
      return res.status(400).json({ success: false, error: { message: 'known must be a boolean' } });
    }
    const flashcard = await flashcardService.reviewFlashcard(req.userId, req.params.id, known);
    res.json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
});

// Delete flashcards for a content
router.delete('/content/:contentId', authenticate, async (req, res, next) => {
  try {
    const count = await flashcardService.deleteFlashcards(req.userId, req.params.contentId);
    res.json({ success: true, data: { deletedCount: count } });
  } catch (error) {
    next(error);
  }
});

// Export to Anki format
router.get('/export/anki', authenticate, async (req, res, next) => {
  try {
    const { contentId } = req.query;
    const ankiText = await flashcardService.exportToAnki(req.userId, contentId);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="flashcards.txt"');
    res.send(ankiText);
  } catch (error) {
    next(error);
  }
});

// Get flashcard stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const stats = await flashcardService.getStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
