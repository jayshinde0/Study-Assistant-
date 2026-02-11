import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Bookmark, FileText, Link } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import client from '../api/client';

export const Content = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [generatingQuizId, setGeneratingQuizId] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [filterTab, setFilterTab] = useState('all');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await client.get('/content');
      setContents(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadData = { title };
      
      if (activeTab === 'text') {
        if (!text.trim()) {
          alert('Please enter some text');
          setLoading(false);
          return;
        }
        uploadData.text = text;
        uploadData.type = 'text';
      } else if (activeTab === 'pdf') {
        if (!pdfUrl.trim()) {
          alert('Please enter a PDF URL');
          setLoading(false);
          return;
        }
        uploadData.pdfUrl = pdfUrl;
        uploadData.type = 'pdf';
      } else if (activeTab === 'youtube') {
        if (!youtubeUrl.trim()) {
          alert('Please enter a YouTube URL');
          setLoading(false);
          return;
        }
        uploadData.youtubeUrl = youtubeUrl;
        uploadData.type = 'youtube';
      }

      const res = await client.post('/content/upload', uploadData);
      setContents([res.data.data, ...contents]);
      setTitle('');
      setText('');
      setPdfUrl('');
      setYoutubeUrl('');
      alert('Material uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload material: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = (content) => {
    setSelectedContent(content);
    setShowSummary(true);
  };

  const handleStartQuiz = async () => {
    if (!selectedContent) return;
    
    setGeneratingQuizId(selectedContent._id);
    setShowSummary(false);
    
    try {
      const res = await client.post('/quiz/generate', { contentId: selectedContent._id });
      if (res.data.data && res.data.data._id) {
        localStorage.setItem('currentQuiz', JSON.stringify(res.data.data));
        navigate('/quiz', { state: { quiz: res.data.data } });
      } else {
        alert('Quiz generated but response format unexpected');
        setGeneratingQuizId(null);
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      alert('Failed to generate quiz: ' + (error.response?.data?.error?.message || error.message));
      setGeneratingQuizId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Modal */}
      {showSummary && selectedContent && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-6 pb-4 border-b">
              <div className="flex items-center gap-3 mb-3">
                {selectedContent.type === 'pdf' && <span className="text-3xl">📄</span>}
                {selectedContent.type === 'youtube' && <span className="text-3xl">🎥</span>}
                {selectedContent.type === 'text' && <span className="text-3xl">📝</span>}
                <div>
                  <h3 className="text-2xl font-bold">{selectedContent.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Type: <span className="font-semibold capitalize">{selectedContent.type}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3">📚 Topics Covered:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedContent.topics && selectedContent.topics.length > 0 ? (
                  selectedContent.topics.map((topic, idx) => (
                    <span key={idx} className="bg-primary bg-opacity-20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No topics extracted yet</p>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3">📖 Content Preview:</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedContent.originalText?.substring(0, 800)}
                  {selectedContent.originalText && selectedContent.originalText.length > 800 && '...'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedContent.topics?.length || 0}
                </p>
                <p className="text-xs text-gray-600">Topics</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.ceil((selectedContent.originalText?.length || 0) / 100)}
                </p>
                <p className="text-xs text-gray-600">Sections</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {selectedContent.type === 'youtube' ? '🎥' : selectedContent.type === 'pdf' ? '📄' : '📝'}
                </p>
                <p className="text-xs text-gray-600">Type</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowSummary(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartQuiz}
                className="flex-1"
              >
                ✨ Start Quiz
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Loading Modal */}
      {generatingQuizId && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="max-w-md w-full mx-4">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <h3 className="text-xl font-bold mb-2">🤖 Generating Quiz</h3>
              <p className="text-gray-600 mb-4">
                AI is analyzing your material and creating questions...
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>⏳ This may take 10-15 seconds</p>
                <p>💡 Please wait while Ollama processes</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-6">📚 Smart Library</h1>
        <p className="text-gray-600 mb-6">Upload and manage your study materials</p>

        <Card>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Text Upload
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'pdf'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 PDF URL
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'youtube'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎥 YouTube URL
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g., Biology Chapter 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Text Tab */}
            {activeTab === 'text' && (
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  className="input-field min-h-48"
                  placeholder="Paste your study material here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>
            )}

            {/* PDF Tab */}
            {activeTab === 'pdf' && (
              <div>
                <label className="block text-sm font-medium mb-2">PDF URL</label>
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📌 Paste a direct link to a PDF file. The AI will extract text from it.
                </p>
              </div>
            )}

            {/* YouTube Tab */}
            {activeTab === 'youtube' && (
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📌 Paste a YouTube video link. The AI will extract the transcript and create questions.
                </p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              <Upload className="w-4 h-4 mr-2 inline" />
              Upload Material
            </Button>
          </form>
        </Card>
      </motion.div>

      {fetchLoading ? (
        <div className="text-center py-12">Loading your materials...</div>
      ) : contents.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">📖 Your Materials</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filterTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({contents.length})
            </button>
            <button
              onClick={() => setFilterTab('text')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filterTab === 'text'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Text ({contents.filter(c => c.type === 'text').length})
            </button>
            <button
              onClick={() => setFilterTab('pdf')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filterTab === 'pdf'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 PDF ({contents.filter(c => c.type === 'pdf').length})
            </button>
            <button
              onClick={() => setFilterTab('youtube')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filterTab === 'youtube'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎥 YouTube ({contents.filter(c => c.type === 'youtube').length})
            </button>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents
              .filter(c => filterTab === 'all' || c.type === filterTab)
              .map((content) => (
              <Card key={content._id}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {content.type === 'pdf' && <span className="text-xl">📄</span>}
                    {content.type === 'youtube' && <span className="text-xl">🎥</span>}
                    {content.type === 'text' && <span className="text-xl">📝</span>}
                    <h3 className="font-bold text-lg">{content.title}</h3>
                  </div>
                  <Bookmark className="w-5 h-5 text-gray-400 cursor-pointer hover:text-primary" />
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {content.topics?.join(', ') || 'Processing...'}
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleGenerateQuiz(content)}
                  disabled={generatingQuizId !== null}
                >
                  {generatingQuizId === content._id ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No materials yet. Upload one to get started!</p>
          <p className="text-sm">Choose from Text, PDF, or YouTube to begin.</p>
        </div>
      )}
    </div>
  );
};
