import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions();
    } else if (query.length === 0) {
      setSuggestions(null);
      setResults(null);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      const res = await client.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      setSuggestions(res.data.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await client.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data.data.results);
      setQuery(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');

    switch (result.resultType) {
      case 'content':
        // Navigate to content page with the material
        navigate(`/content?id=${result.id}`);
        break;

      case 'topic':
        // Navigate to learning path and filter by topic
        navigate(`/learning-path?topic=${encodeURIComponent(result.name)}`);
        break;

      case 'flashcard':
        // Navigate to flashcards page with the card
        navigate(`/flashcards?cardId=${result.id}`);
        break;

      case 'chatSession':
        // Navigate to chatbot with the session
        navigate(`/chatbot?sessionId=${result.id}`);
        break;

      case 'quiz':
        // Navigate to quiz page
        navigate(`/quiz?quizId=${result.id}`);
        break;

      default:
        break;
    }
  };

  const getResultIcon = (resultType) => {
    switch (resultType) {
      case 'content':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'topic':
        return <Zap className="w-4 h-4 text-warning" />;
      case 'flashcard':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'chatSession':
        return <MessageSquare className="w-4 h-4 text-success" />;
      case 'quiz':
        return <Zap className="w-4 h-4 text-red-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultLabel = (resultType) => {
    switch (resultType) {
      case 'content':
        return 'Material';
      case 'topic':
        return 'Topic';
      case 'flashcard':
        return 'Flashcard';
      case 'chatSession':
        return 'Chat';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Result';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search topics, materials, quizzes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setSuggestions(null);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (query || suggestions) && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loading && (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Search Results */}
            {results && !loading && (
              <div className="p-2">
                {/* Contents */}
                {results.contents.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Materials</p>
                    {results.contents.map((content) => (
                      <button
                        key={content.id}
                        onClick={() => handleResultClick(content)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-start gap-3"
                      >
                        <BookOpen className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{content.title}</p>
                          {content.topics.length > 0 && (
                            <p className="text-xs text-gray-500 truncate">
                              {content.topics.join(', ')}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Topics */}
                {results.topics.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Topics</p>
                    {results.topics.map((topic) => (
                      <button
                        key={topic.name}
                        onClick={() => handleResultClick(topic)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-3"
                      >
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-sm">{topic.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Flashcards */}
                {results.flashcards.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Flashcards</p>
                    {results.flashcards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleResultClick(card)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-start gap-3"
                      >
                        <BookOpen className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{card.front}</p>
                          <p className="text-xs text-gray-500 truncate">{card.topic}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Sessions */}
                {results.chatHistory.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Chat Sessions</p>
                    {results.chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleResultClick(chat)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-start gap-3"
                      >
                        <MessageSquare className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{chat.title}</p>
                          <p className="text-xs text-gray-500">{chat.messageCount} messages</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quizzes */}
                {results.quizzes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Quizzes</p>
                    {results.quizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        onClick={() => handleResultClick(quiz)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-3"
                      >
                        <Zap className="w-4 h-4 text-red-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Quiz - {quiz.accuracy}% ({quiz.score}/{quiz.totalQuestions})
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {Object.values(results).every(arr => arr.length === 0) && (
                  <div className="p-4 text-center text-gray-500">
                    <p>No results found for "{query}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions && !results && !loading && (
              <div className="p-2">
                {/* Recent Searches */}
                {suggestions.recent && (
                  <>
                    {suggestions.recent.recentContents.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Recent Materials
                        </p>
                        {suggestions.recent.recentContents.map((content) => (
                          <button
                            key={content.id}
                            onClick={() => handleSuggestionClick(content.title)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-3"
                          >
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm truncate">{content.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {suggestions.recent.recentTopics.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Recent Topics
                        </p>
                        {suggestions.recent.recentTopics.map((topic) => (
                          <button
                            key={topic.name}
                            onClick={() => handleResultClick(topic)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-3"
                          >
                            <Zap className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-sm">{topic.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Suggestions */}
                {suggestions.contentTitles && suggestions.contentTitles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Suggestions</p>
                    {suggestions.contentTitles.map((title) => (
                      <button
                        key={title}
                        onClick={() => handleSuggestionClick(title)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm truncate">{title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.topics && suggestions.topics.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Topics</p>
                    {suggestions.topics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleResultClick({ name: topic, resultType: 'topic' })}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-3"
                      >
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-sm">{topic}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
