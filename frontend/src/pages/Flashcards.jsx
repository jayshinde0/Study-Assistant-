import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';

export const Flashcards = () => {
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [mode, setMode] = useState('select'); // select, study, complete
  const [contentFlashcardCounts, setContentFlashcardCounts] = useState({});

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    fetchContents();
    fetchStats();
    fetchAllFlashcards();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await client.get('/content');
      setContents(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await client.get('/flashcards/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAllFlashcards = async () => {
    try {
      const res = await client.get('/flashcards');
      const counts = {};
      res.data.data.forEach(card => {
        const contentId = card.contentId._id || card.contentId;
        counts[contentId] = (counts[contentId] || 0) + 1;
      });
      setContentFlashcardCounts(counts);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
  };

  const generateFlashcards = async (contentId) => {
    setLoading(true);
    try {
      // This will either generate new flashcards or return existing ones
      const res = await client.post('/flashcards/generate', { contentId, count: 15 });
      setFlashcards(res.data.data);
      setCurrentIndex(0);
      setMode('study');
      fetchStats();
      fetchAllFlashcards();
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcards = async (contentId) => {
    if (!window.confirm('Delete all flashcards for this content?')) {
      return;
    }
    
    setLoading(true);
    try {
      await client.delete(`/flashcards/content/${contentId}`);
      fetchStats();
      fetchAllFlashcards();
      alert('Flashcards deleted successfully');
    } catch (error) {
      alert('Failed to delete flashcards');
    } finally {
      setLoading(false);
    }
  };

  const loadFlashcards = async (contentId) => {
    setLoading(true);
    try {
      const res = await client.get(`/flashcards?contentId=${contentId}`);
      if (res.data.data.length === 0) {
        alert('No flashcards found. Generate them first!');
        return;
      }
      setFlashcards(res.data.data);
      setCurrentIndex(0);
      setMode('study');
    } catch (error) {
      alert('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (known) => {
    const currentCard = flashcards[currentIndex];
    
    try {
      await client.post(`/flashcards/${currentCard._id}/review`, { known });
      fetchStats();
    } catch (error) {
      console.error('Failed to review flashcard:', error);
    }

    // Reset flip state before moving to next card
    setIsFlipped(false);

    // Move to next card after a short delay to show the reset
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        x.set(0);
      } else {
        setMode('complete');
      }
    }, 100);
  };

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      const known = info.offset.x > 0;
      handleSwipe(known);
    } else {
      x.set(0);
    }
  };

  const exportToAnki = async () => {
    try {
      const contentId = selectedContent?._id;
      const url = contentId 
        ? `/flashcards/export/anki?contentId=${contentId}`
        : '/flashcards/export/anki';
      
      const response = await client.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'flashcards.txt';
      link.click();
    } catch (error) {
      alert('Failed to export flashcards');
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          🎴 Flashcards
        </h1>
        <p className="text-gray-600">Quick revision with spaced repetition</p>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-gray-600">Total Cards</p>
          </Card>
          <Card className="text-center bg-green-50">
            <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
            <p className="text-xs text-gray-600">Mastered</p>
          </Card>
          <Card className="text-center bg-blue-50">
            <p className="text-2xl font-bold text-blue-600">{stats.learning}</p>
            <p className="text-xs text-gray-600">Learning</p>
          </Card>
          <Card className="text-center bg-yellow-50">
            <p className="text-2xl font-bold text-yellow-600">{stats.new}</p>
            <p className="text-xs text-gray-600">New</p>
          </Card>
          <Card className="text-center bg-red-50">
            <p className="text-2xl font-bold text-red-600">{stats.dueForReview}</p>
            <p className="text-xs text-gray-600">Due Today</p>
          </Card>
        </div>
      )}

      {/* Select Content Mode */}
      {mode === 'select' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Select Content</h2>
            <Button variant="secondary" onClick={exportToAnki}>
              📥 Export to Anki
            </Button>
          </div>

          {contents.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600">No content available. Upload some study materials first!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map(content => {
                const flashcardCount = contentFlashcardCounts[content._id] || 0;
                const hasFlashcards = flashcardCount > 0;

                return (
                  <Card key={content._id} className="hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">
                        {content.type === 'pdf' ? '📄' : content.type === 'youtube' ? '🎥' : '📝'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold line-clamp-2">{content.title}</h3>
                        <p className="text-xs text-gray-500 capitalize">{content.type}</p>
                        {hasFlashcards && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            ✅ {flashcardCount} flashcards
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedContent(content);
                          generateFlashcards(content._id);
                        }}
                        loading={loading}
                      >
                        {hasFlashcards ? '📚 Study' : '✨ Generate'}
                      </Button>
                      {hasFlashcards && (
                        <Button
                          variant="secondary"
                          className="px-3"
                          onClick={() => deleteFlashcards(content._id)}
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Study Mode */}
      {mode === 'study' && currentCard && (
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Card {currentIndex + 1} of {flashcards.length}
              </p>
              <Button variant="secondary" size="sm" onClick={() => setMode('select')}>
                ← Back
              </Button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <motion.div
            key={currentCard._id} // Force re-render on card change
            className="relative h-96 cursor-pointer"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <Card
                className="absolute inset-0 flex items-center justify-center text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div>
                  <p className="text-sm text-gray-500 mb-4">Question</p>
                  <p className="text-2xl font-bold">{currentCard.front}</p>
                  <p className="text-sm text-gray-400 mt-6">Tap to flip</p>
                </div>
              </Card>

              {/* Back */}
              <Card
                className="absolute inset-0 flex items-center justify-center text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div>
                  <p className="text-sm text-gray-500 mb-4">Answer</p>
                  <p className="text-xl">{currentCard.back}</p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {currentCard.topic}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {currentCard.difficulty}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Swipe Instructions */}
          <div className="flex items-center justify-between mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(false)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium shadow-lg"
            >
              ❌ Don't Know
            </motion.button>

            <p className="text-sm text-gray-500">Swipe or tap buttons</p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium shadow-lg"
            >
              ✅ Know It
            </motion.button>
          </div>

          {/* Mastery Level */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Mastery Level</p>
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    level <= currentCard.masteryLevel
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Mode */}
      {mode === 'complete' && (
        <Card className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
          <p className="text-gray-600 mb-8">
            You've reviewed {flashcards.length} flashcards
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={() => setMode('select')}>
              Back to Library
            </Button>
            <Button onClick={() => {
              setCurrentIndex(0);
              setMode('study');
            }}>
              Study Again
            </Button>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="text-center py-12 px-8">
            <motion.div
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-gray-600">Generating flashcards...</p>
          </Card>
        </div>
      )}
    </div>
  );
};
