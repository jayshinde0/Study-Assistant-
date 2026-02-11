import axios from 'axios';

// Ollama API endpoint (runs locally)
const OLLAMA_API = 'http://localhost:11434/api/generate';

export class GeminiService {
  async generateSummary(text, type = 'brief') {
    try {
      const prompts = {
        brief: `Summarize this in 2-3 sentences:\n\n${text}`,
        detailed: `Provide a detailed summary (5-7 sentences):\n\n${text}`,
        comprehensive: `Provide a comprehensive summary with key points:\n\n${text}`
      };

      const response = await axios.post(OLLAMA_API, {
        model: 'mistral',
        prompt: prompts[type],
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('❌ Ollama API error:', error.message);
      console.warn('⚠️ FALLBACK: Using mock summary (Ollama not running)');
      return this.getMockSummary(text, type);
    }
  }

  async generateQuiz(text, difficulty = 'medium', count = 5) {
    try {
      const prompt = `Generate exactly 5 multiple choice questions about this text. For each question, provide:
1. question (string)
2. options (array of exactly 4 strings - just the answer text, no letters)
3. correctAnswer (must be EXACTLY one of the 4 options as a string, not an array)
4. explanation (string)

Return ONLY valid JSON array, no other text. Example format:
[{"question":"What is X?","options":["Answer1","Answer2","Answer3","Answer4"],"correctAnswer":"Answer1","explanation":"Because..."}]

Text: ${text}`;

      const response = await axios.post(OLLAMA_API, {
        model: 'mistral',
        prompt: prompt,
        stream: false
      });

      try {
        const responseText = response.data.response || '';
        
        // Try to extract JSON array
        let jsonStr = responseText.trim();
        
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Find the JSON array
        const startIdx = jsonStr.indexOf('[');
        const endIdx = jsonStr.lastIndexOf(']');
        
        if (startIdx !== -1 && endIdx !== -1) {
          jsonStr = jsonStr.substring(startIdx, endIdx + 1);
          
          // Clean up common JSON issues
          jsonStr = jsonStr.replace(/[\n\r\t]/g, ' ');
          jsonStr = jsonStr.replace(/,\s*]/g, ']');
          jsonStr = jsonStr.replace(/,\s*}/g, '}');
          jsonStr = jsonStr.replace(/:\s*\[/g, ':[');
          
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Validate and fix each question
            return parsed.map(q => {
              // Ensure options is an array of strings
              let options = Array.isArray(q.options) ? q.options : [q.options || ''];
              options = options.map(opt => String(opt).trim());
              
              // Ensure correctAnswer is a string and is one of the options
              let correctAnswer = String(q.correctAnswer || '').trim();
              
              // If correctAnswer is not in options, use first option
              if (!options.includes(correctAnswer)) {
                correctAnswer = options[0];
              }
              
              return {
                question: String(q.question || '').trim(),
                options: options,
                correctAnswer: correctAnswer,
                explanation: String(q.explanation || '').trim()
              };
            });
          }
        }
      } catch (error) {
        console.error('Error parsing quiz JSON:', error.message);
      }
      
      console.warn('⚠️ FALLBACK: Using mock quiz (Ollama response parsing failed)');
      return this.getMockQuiz(difficulty);
    } catch (error) {
      console.error('❌ Ollama API error:', error.message);
      console.warn('⚠️ FALLBACK: Using mock quiz (Ollama not responding)');
      return this.getMockQuiz(difficulty);
    }
  }

  async generateRecommendations(weakTopics, performanceData) {
    try {
      const prompt = `Based on weak topics: ${weakTopics.join(', ')} and performance data: ${JSON.stringify(performanceData)}, provide 3 personalized learning recommendations in JSON format: [{"topic": "...", "action": "...", "reason": "..."}]`;

      const response = await axios.post(OLLAMA_API, {
        model: 'mistral',
        prompt: prompt,
        stream: false
      });

      try {
        const responseText = response.data.response || '';
        
        // Remove markdown code blocks
        let jsonStr = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Find JSON array
        const startIdx = jsonStr.indexOf('[');
        const endIdx = jsonStr.lastIndexOf(']');
        
        if (startIdx !== -1 && endIdx !== -1) {
          jsonStr = jsonStr.substring(startIdx, endIdx + 1);
          jsonStr = jsonStr.replace(/[\n\r\t]/g, ' ');
          jsonStr = jsonStr.replace(/,\s*]/g, ']');
          jsonStr = jsonStr.replace(/,\s*}/g, '}');
          
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(r => ({
              topic: String(r.topic || '').trim(),
              action: String(r.action || '').trim(),
              reason: String(r.reason || '').trim()
            }));
          }
        }
      } catch (error) {
        console.error('Error parsing recommendations:', error.message);
      }
      console.warn('⚠️ FALLBACK: Using mock recommendations (Ollama response parsing failed)');
      return this.getMockRecommendations(weakTopics);
    } catch (error) {
      console.error('❌ Ollama API error:', error.message);
      console.warn('⚠️ FALLBACK: Using mock recommendations (Ollama not responding)');
      return this.getMockRecommendations(weakTopics);
    }
  }

  async extractTopics(text) {
    try {
      const prompt = `Extract 5-10 main topics from this text. Return ONLY a JSON array of topic strings, no other text.
Example: ["Topic1","Topic2","Topic3"]

Text: ${text}`;

      const response = await axios.post(OLLAMA_API, {
        model: 'mistral',
        prompt: prompt,
        stream: false
      });

      try {
        const responseText = response.data.response || '';
        
        // Remove markdown code blocks
        let jsonStr = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Find JSON array
        const startIdx = jsonStr.indexOf('[');
        const endIdx = jsonStr.lastIndexOf(']');
        
        if (startIdx !== -1 && endIdx !== -1) {
          jsonStr = jsonStr.substring(startIdx, endIdx + 1);
          jsonStr = jsonStr.replace(/[\n\r\t]/g, ' ');
          jsonStr = jsonStr.replace(/,\s*]/g, ']');
          jsonStr = jsonStr.replace(/,\s*}/g, '}');
          
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(t => String(t).trim());
          }
        }
      } catch (error) {
        console.error('Error parsing topics:', error.message);
      }
      
      console.warn('⚠️ FALLBACK: Using mock topics (Ollama response parsing failed)');
      return this.getMockTopics(text);
    } catch (error) {
      console.error('❌ Ollama API error:', error.message);
      console.warn('⚠️ FALLBACK: Using mock topics (Ollama not responding)');
      return this.getMockTopics(text);
    }
  }

  // Mock data for when API fails
  getMockSummary(text, type) {
    const sentences = text.split('.').filter(s => s.trim());
    if (type === 'brief') {
      return sentences.slice(0, 2).join('. ') + '.';
    } else if (type === 'detailed') {
      return sentences.slice(0, 5).join('. ') + '.';
    } else {
      return text;
    }
  }

  getMockQuiz(difficulty) {
    const difficulties = {
      easy: [
        { question: 'What is the main topic discussed?', options: ['Photosynthesis', 'Respiration', 'Digestion', 'Circulation'], correctAnswer: 'Photosynthesis', explanation: 'This is the primary topic of the material.' },
        { question: 'Which process is described?', options: ['Fermentation', 'Photosynthesis', 'Combustion', 'Oxidation'], correctAnswer: 'Photosynthesis', explanation: 'The material focuses on this biological process.' },
        { question: 'Where does this occur?', options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'], correctAnswer: 'Chloroplast', explanation: 'This is the correct cellular location.' },
        { question: 'What is produced?', options: ['ATP only', 'Glucose and Oxygen', 'Carbon Dioxide', 'Water'], correctAnswer: 'Glucose and Oxygen', explanation: 'These are the main products.' },
        { question: 'What is required?', options: ['Heat and Pressure', 'Light Energy and Water', 'Electricity', 'Chemicals'], correctAnswer: 'Light Energy and Water', explanation: 'These are the key inputs.' }
      ],
      medium: [
        { question: 'Analyze the concept of light-dependent reactions', options: ['Occurs in stroma', 'Produces ATP and NADPH', 'Does not require light', 'Produces glucose directly'], correctAnswer: 'Produces ATP and NADPH', explanation: 'Light-dependent reactions generate energy carriers.' },
        { question: 'What is the relationship between the two stages?', options: ['Independent processes', 'First stage provides energy for second', 'Second stage provides energy for first', 'They are identical'], correctAnswer: 'First stage provides energy for second', explanation: 'The light reactions provide ATP and NADPH for the Calvin cycle.' },
        { question: 'How does photolysis contribute?', options: ['Produces glucose', 'Splits water and releases oxygen', 'Fixes carbon dioxide', 'Creates ATP'], correctAnswer: 'Splits water and releases oxygen', explanation: 'Water splitting is a key part of light reactions.' },
        { question: 'What role does chlorophyll play?', options: ['Stores glucose', 'Absorbs light energy', 'Produces oxygen', 'Fixes CO2'], correctAnswer: 'Absorbs light energy', explanation: 'Chlorophyll is the primary light-absorbing pigment.' },
        { question: 'How is efficiency affected?', options: ['Only by temperature', 'By light intensity, temperature, and CO2', 'Only by CO2 concentration', 'Not affected by external factors'], correctAnswer: 'By light intensity, temperature, and CO2', explanation: 'Multiple factors influence photosynthetic efficiency.' }
      ],
      hard: [
        { question: 'Evaluate the electron transport chain in photosynthesis', options: ['Produces only ATP', 'Transfers electrons and creates proton gradient', 'Directly produces glucose', 'Is independent of light'], correctAnswer: 'Transfers electrons and creates proton gradient', explanation: 'The electron transport chain is crucial for energy production.' },
        { question: 'Synthesize the relationship between photosynthesis and cellular respiration', options: ['They are opposite processes', 'Photosynthesis produces glucose for respiration', 'They occur simultaneously', 'They are unrelated'], correctAnswer: 'Photosynthesis produces glucose for respiration', explanation: 'These processes are complementary in the biosphere.' },
        { question: 'What is the critical limitation in the Calvin cycle?', options: ['Lack of light', 'CO2 concentration and enzyme efficiency', 'Excess oxygen', 'Temperature stability'], correctAnswer: 'CO2 concentration and enzyme efficiency', explanation: 'These factors limit the rate of glucose production.' },
        { question: 'Predict the outcome of increased CO2 levels', options: ['Decreased photosynthesis', 'Increased photosynthesis until saturation', 'No effect', 'Photosynthesis stops'], correctAnswer: 'Increased photosynthesis until saturation', explanation: 'CO2 is a limiting factor that can be increased to a point.' },
        { question: 'Justify why photosynthesis is essential for life', options: ['Produces oxygen for respiration', 'Converts light to chemical energy', 'Forms the base of food chains', 'All of the above'], correctAnswer: 'All of the above', explanation: 'Photosynthesis is fundamental to life on Earth.' }
      ]
    };
    return difficulties[difficulty] || difficulties.medium;
  }

  getMockTopics(text) {
    // Extract potential topics from text
    const words = text.split(/\s+/);
    const topics = [];
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were'];
    
    for (let i = 0; i < Math.min(8, words.length); i++) {
      const word = words[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (word.length > 3 && !commonWords.includes(word)) {
        topics.push(word.charAt(0).toUpperCase() + word.slice(1));
      }
    }
    
    return topics.length > 0 ? topics : ['General Topic', 'Key Concept', 'Main Idea'];
  }

  getMockRecommendations(weakTopics) {
    return [
      {
        topic: weakTopics[0] || 'General',
        action: 'Practice more questions on this topic',
        reason: 'Your accuracy is below 70%'
      },
      {
        topic: weakTopics[1] || 'Advanced',
        action: 'Review the fundamentals first',
        reason: 'Build a strong foundation'
      },
      {
        topic: weakTopics[2] || 'Challenge',
        action: 'Take harder quizzes',
        reason: 'Push yourself to improve'
      }
    ];
  }
}

export default new GeminiService();
