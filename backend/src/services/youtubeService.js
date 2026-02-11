import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import pkg from 'youtube-captions-scraper';
const { getTranscript } = pkg;

export class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Extract video ID from YouTube URL
  extractVideoId(url) {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return videoId;
  }

  // Get video details using noembed API (no auth needed)
  async getVideoDetailsNoAuth(videoId) {
    try {
      const response = await axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
        timeout: 5000
      });
      
      return {
        title: response.data.title || 'YouTube Video',
        description: response.data.description || '',
        channelTitle: response.data.author_name || 'Unknown Channel',
        thumbnail: response.data.thumbnail_url
      };
    } catch (error) {
      console.warn('NoEmbed API failed:', error.message);
      return null;
    }
  }

  // Get video details using YouTube API
  async getVideoDetails(videoId) {
    try {
      if (!this.apiKey) {
        console.warn('YouTube API key not configured, using fallback');
        return await this.getVideoDetailsNoAuth(videoId);
      }

      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          id: videoId,
          part: 'snippet,contentDetails,statistics',
          key: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        return {
          title: video.snippet.title,
          description: video.snippet.description,
          duration: video.contentDetails.duration,
          channelTitle: video.snippet.channelTitle,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount
        };
      }
      
      // Fallback to noembed if API returns no items
      return await this.getVideoDetailsNoAuth(videoId);
    } catch (error) {
      console.warn('YouTube API failed, using fallback:', error.message);
      return await this.getVideoDetailsNoAuth(videoId);
    }
  }

  // Get transcript from YouTube - with multiple fallback methods
  async getTranscript(videoId) {
    try {
      console.log(`📝 Fetching transcript for video: ${videoId}`);
      
      // Method 1: Try youtube-captions-scraper (most reliable)
      try {
        console.log(`📝 Method 1: Using youtube-captions-scraper...`);
        const captions = await getTranscript({ videoID: videoId });
        
        if (captions && captions.length > 0) {
          const text = captions.map(c => c.text).join(' ');
          const trimmedText = text.slice(0, 8000);
          console.log(`✅ Transcript extracted (Method 1): ${trimmedText.length} characters`);
          return trimmedText;
        }
      } catch (error) {
        console.warn(`⚠️ Method 1 failed: ${error.message}`);
      }

      // Method 2: Try youtube-transcript package
      try {
        console.log(`📝 Method 2: Using youtube-transcript...`);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        
        if (transcript && transcript.length > 0) {
          const text = transcript.map(t => t.text).join(' ');
          const trimmedText = text.slice(0, 8000);
          console.log(`✅ Transcript extracted (Method 2): ${trimmedText.length} characters`);
          return trimmedText;
        }
      } catch (error) {
        console.warn(`⚠️ Method 2 failed: ${error.message}`);
      }

      // Method 3: Try YouTube API with different parameters
      try {
        console.log(`📝 Method 3: Trying YouTube API...`);
        const response = await axios.get(
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
          { timeout: 5000 }
        );
        
        if (response.data) {
          const text = response.data
            .replace(/<[^>]*>/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (text && text.length > 100) {
            const trimmedText = text.slice(0, 8000);
            console.log(`✅ Transcript extracted (Method 3): ${trimmedText.length} characters`);
            return trimmedText;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Method 3 failed: ${error.message}`);
      }

      console.warn('⚠️ No transcript found - video may not have captions enabled or accessible');
      console.warn('   This is normal for some videos. Quiz will use title and description instead.');
      return null;
    } catch (error) {
      console.warn(`⚠️ Transcript extraction error: ${error.message}`);
      return null;
    }
  }

  // Get full video content (title + description + transcript)
  async getFullContent(youtubeUrl) {
    try {
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      console.log(`📺 Extracting content from YouTube video: ${videoId}`);

      // Get video details
      const details = await this.getVideoDetails(videoId);
      if (!details) {
        throw new Error('Could not fetch video details');
      }

      // Try to get transcript
      let transcript = null;
      try {
        transcript = await this.getTranscript(videoId);
      } catch (error) {
        console.warn('Could not fetch transcript:', error.message);
      }

      // Combine all content
      let fullContent = `Video Title: ${details.title}\n\n`;
      fullContent += `Channel: ${details.channelTitle}\n\n`;
      fullContent += `Description:\n${details.description}\n\n`;
      
      if (transcript) {
        fullContent += `Transcript:\n${transcript}`;
      } else {
        fullContent += `Note: Transcript not available. Using video title and description for quiz generation.`;
      }

      console.log(`✅ YouTube content extracted: ${details.title}`);

      return {
        title: details.title,
        content: fullContent,
        description: details.description,
        transcript: transcript
      };
    } catch (error) {
      console.error('Error getting full content:', error.message);
      throw error;
    }
  }
}

export default new YouTubeService();
