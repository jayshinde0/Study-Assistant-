import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Trash2, Zap } from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export const ChatBot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const token = useAuthStore((state) => state.token);

  // State
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [hasContent, setHasContent] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user has content
  useEffect(() => {
    const checkContent = async () => {
      try {
        const res = await client.get('/content');
        setHasContent(res.data.data && res.data.data.length > 0);
      } catch (error) {
        console.error('Error checking content:', error);
        setHasContent(false);
      }
    };
    checkContent();
  }, []);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await client.get('/chatbot/sessions?limit=10');
        setSessions(res.data.data.sessions || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    };
    loadSessions();
  }, []);

  // Send message
  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return;

    // Check if user is authenticated
    if (!token) {
      console.error('❌ No token found, user not authenticated');
      const errorMessage = {
        role: 'assistant',
        content: 'Please log in to use the chatbot'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setSuggestedQuestions([]);

    try {
      console.log('📨 Sending message:', message);
      const res = await client.post('/chatbot/message', {
        message,
        sessionId
      });

      console.log('✅ Got response:', res.data.data);
      const { response, suggestedQuestions: suggestions, sources, topics } = res.data.data;

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response,
        sources,
        suggestedQuestions: suggestions,
        topics
      };
      setMessages(prev => [...prev, aiMessage]);
      setSuggestedQuestions(suggestions);

      // Update session ID
      if (!sessionId) {
        setSessionId(res.data.data.sessionId);
      }

      // Reload sessions
      const sessionsRes = await client.get('/chatbot/sessions?limit=10');
      setSessions(sessionsRes.data.data.sessions || []);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = {
        role: 'assistant',
        content: error.response?.data?.error?.message || 'Failed to get response. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Start new chat
  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setSuggestedQuestions([]);
  };

  // Load session
  const handleLoadSession = async (id) => {
    try {
      const res = await client.get(`/chatbot/history/${id}`);
      const chatData = res.data.data;
      
      // Convert to message format
      const formattedMessages = chatData.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
        suggestedQuestions: msg.suggestedQuestions,
        topics: msg.topics
      }));

      setMessages(formattedMessages);
      setSessionId(id);
      setSuggestedQuestions([]);
      setShowSessions(false);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  // Delete session
  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await client.delete(`/chatbot/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
      if (sessionId === id) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (messages.length === 0) return;

    // Extract topics from messages
    const topics = new Set();
    messages.forEach(msg => {
      if (msg.topics) {
        msg.topics.forEach(t => topics.add(t));
      }
    });

    if (topics.size === 0) {
      alert('No topics found in conversation');
      return;
    }

    try {
      setLoading(true);
      const res = await client.post('/chatbot/generate-quiz', {
        topics: Array.from(topics),
        sessionId
      });

      // Store quiz and navigate
      localStorage.setItem('currentQuiz', JSON.stringify({
        ...res.data.data,
        _id: 'chat-quiz-' + Date.now()
      }));

      navigate('/quiz', { state: { quiz: res.data.data } });
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        className={`fixed md:relative w-64 bg-white border-r border-gray-200 flex flex-col h-screen z-40 transition-transform ${
          showSessions ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <Button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase px-2 mb-3">Recent Chats</p>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No chat history yet</p>
          ) : (
            sessions.map(session => (
              <motion.div
                key={session._id}
                onClick={() => handleLoadSession(session._id)}
                whileHover={{ x: 4 }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all group cursor-pointer ${
                  sessionId === session._id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.sessionTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.totalMessages} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session._id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/content')}
            className="w-full text-sm"
          >
            📚 Upload Materials
          </Button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          className="bg-white border-b border-gray-200 p-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Buddy</h1>
              <p className="text-sm text-gray-600">AI-powered learning assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Generate Quiz
              </Button>
            )}
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ☰
            </button>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <motion.div
              className="h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="text-center max-w-md bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                <div className="text-5xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Study Buddy</h2>
                <p className="text-gray-600 mb-6">
                  Ask me anything about your uploaded study materials. I'll provide answers based on your content and suggest follow-up questions.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-sm font-semibold text-gray-700">💡 Try asking:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "Explain photosynthesis"</li>
                    <li>• "What are the key concepts?"</li>
                    <li>• "How does this relate to...?"</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg.content}
                  isUser={msg.role === 'user'}
                  sources={msg.sources}
                  suggestedQuestions={msg.suggestedQuestions}
                  onSuggestedClick={handleSendMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && messages.length > 0 && (
          <div className="px-6">
            <SuggestedQuestions
              questions={suggestedQuestions}
              onQuestionClick={handleSendMessage}
              loading={loading}
            />
          </div>
        )}

        {/* Input Area */}
        {hasContent ? (
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={loading}
            disabled={false}
          />
        ) : (
          <motion.div
            className="border-t border-gray-200 bg-white p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-orange-50 border-orange-200 text-center">
              <p className="text-orange-800 font-semibold mb-3">📁 No Study Materials Found</p>
              <p className="text-orange-700 text-sm mb-4">
                Upload some study materials first to start chatting with the AI.
              </p>
              <Button onClick={() => navigate('/content')} className="w-full">
                Upload Materials
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
