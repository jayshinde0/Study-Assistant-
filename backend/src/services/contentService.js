import Content from '../models/Content.js';
import geminiService from './geminiService.js';
import { AppError } from '../middleware/errorHandler.js';

export class ContentService {
  async uploadContent(userId, title, text, contentType = 'text') {
    const content = new Content({
      userId,
      title,
      originalText: text,
      fileType: contentType,
      type: contentType
    });

    // Extract topics
    content.topics = await geminiService.extractTopics(text);

    await content.save();
    return content;
  }

  async generateSummaries(contentId) {
    const content = await Content.findById(contentId);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    content.summaries.brief = await geminiService.generateSummary(content.originalText, 'brief');
    content.summaries.detailed = await geminiService.generateSummary(content.originalText, 'detailed');
    content.summaries.comprehensive = await geminiService.generateSummary(content.originalText, 'comprehensive');

    await content.save();
    return content;
  }

  async getContent(contentId, userId) {
    const content = await Content.findById(contentId);
    if (!content || content.userId.toString() !== userId) {
      throw new AppError('Content not found', 404);
    }
    return content;
  }

  async getUserContents(userId) {
    return Content.find({ userId }).sort({ createdAt: -1 });
  }

  async toggleBookmark(contentId, userId) {
    const content = await Content.findById(contentId);
    if (!content || content.userId.toString() !== userId) {
      throw new AppError('Content not found', 404);
    }

    content.bookmarked = !content.bookmarked;
    await content.save();
    return content;
  }
}

export default new ContentService();
