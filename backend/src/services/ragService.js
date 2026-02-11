import Content from '../models/Content.js';
import { AppError } from '../middleware/errorHandler.js';

class RAGService {
  /**
   * Retrieve relevant content based on user query
   * Uses simple text matching and keyword extraction
   */
  async retrieveRelevantContent(userId, query, limit = 5) {
    try {
      // Get all user's content
      const userContent = await Content.find({ userId }).select('title originalText topics type');

      if (!userContent || userContent.length === 0) {
        return [];
      }

      // Extract keywords from query
      const queryKeywords = this.extractKeywords(query);

      // Score each content based on relevance
      const scoredContent = userContent.map(content => {
        let score = 0;

        // Score based on topic matches
        if (content.topics) {
          content.topics.forEach(topic => {
            queryKeywords.forEach(keyword => {
              if (topic.toLowerCase().includes(keyword.toLowerCase())) {
                score += 3;
              }
            });
          });
        }

        // Score based on text matches
        if (content.originalText) {
          const text = content.originalText.toLowerCase();
          queryKeywords.forEach(keyword => {
            const matches = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
            score += matches * 0.5;
          });
        }

        // Score based on title matches
        if (content.title) {
          queryKeywords.forEach(keyword => {
            if (content.title.toLowerCase().includes(keyword.toLowerCase())) {
              score += 2;
            }
          });
        }

        return {
          ...content.toObject(),
          relevanceScore: score
        };
      });

      // Sort by relevance and return top results
      return scoredContent
        .filter(c => c.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
        .map(c => ({
          id: c._id,
          title: c.title,
          type: c.type,
          topics: c.topics,
          text: c.originalText?.substring(0, 500) || '', // First 500 chars
          relevanceScore: c.relevanceScore
        }));
    } catch (error) {
      console.error('RAG retrieval error:', error);
      return [];
    }
  }

  /**
   * Extract keywords from query
   */
  extractKeywords(query) {
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'will', 'do', 'does', 'did', 'be', 'been', 'being'];

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Limit to 5 keywords
  }

  /**
   * Create context from retrieved content
   */
  createContext(retrievedContent) {
    if (!retrievedContent || retrievedContent.length === 0) {
      return 'No relevant content found in user materials.';
    }

    let context = 'Based on the user\'s study materials:\n\n';

    retrievedContent.forEach((content, idx) => {
      context += `[Source ${idx + 1}: ${content.title}]\n`;
      context += `Topics: ${content.topics?.join(', ') || 'N/A'}\n`;
      context += `Content: ${content.text}\n\n`;
    });

    return context;
  }

  /**
   * Generate suggested follow-up questions
   */
  generateSuggestedQuestions(userMessage, response, topics = []) {
    const suggestions = [];

    // Question 1: Deeper dive
    if (topics.length > 0) {
      suggestions.push(`Can you explain ${topics[0]} in more detail?`);
    } else {
      suggestions.push('Can you provide more details about this?');
    }

    // Question 2: Practical application
    suggestions.push('How can I apply this concept in practice?');

    // Question 3: Related topic
    if (topics.length > 1) {
      suggestions.push(`How does this relate to ${topics[1]}?`);
    } else {
      suggestions.push('What are the key takeaways from this?');
    }

    return suggestions.slice(0, 2); // Return 2 suggestions
  }

  /**
   * Extract topics from response
   */
  extractTopicsFromResponse(response) {
    // Simple extraction - can be enhanced with NLP
    const topics = [];
    const commonTopics = ['concept', 'theory', 'principle', 'method', 'process', 'definition', 'example'];

    commonTopics.forEach(topic => {
      if (response.toLowerCase().includes(topic)) {
        topics.push(topic);
      }
    });

    return topics;
  }
}

export default new RAGService();
