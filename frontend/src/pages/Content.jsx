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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [generatingQuizId, setGeneratingQuizId] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [filterTab, setFilterTab] = useState('all');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryLevel, setSummaryLevel] = useState('brief');

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
      } else if (activeTab === 'file') {
        if (!file) {
          alert('Please select a file');
          setLoading(false);
          return;
        }
        if (!title.trim()) {
          alert('Please enter a title');
          setLoading(false);
          return;
        }

        // Upload file using FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        const res = await client.post('/content/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setContents([res.data.data, ...contents]);
        setTitle('');
        setFile(null);
        alert('File uploaded successfully!');
        setLoading(false);
        return;
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
    setSummaryLevel('brief');
  };

  const handleGenerateSummary = async () => {
    if (!selectedContent) return;
    
    setGeneratingSummary(true);
    try {
      const res = await client.post(`/content/${selectedContent._id}/summarize`);
      setSelectedContent(res.data.data);
      // Update in the list too
      setContents(contents.map(c => c._id === res.data.data._id ? res.data.data : c));
    } catch (error) {
      console.error('Summary generation failed:', error);
      alert('Failed to generate summary: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setGeneratingSummary(false);
    }
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
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-6 pb-4 border-b">
              <div className="flex items-center gap-3 mb-3">
                {selectedContent.type === 'pdf' && <span className="text-3xl">📄</span>}
                {selectedContent.type === 'youtube' && <span className="text-3xl">🎥</span>}
                {selectedContent.type === 'text' && <span className="text-3xl">📝</span>}
                <div className="flex-1">
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

            {/* Summary Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">📝 AI-Generated Summary</h4>
                {!selectedContent.summaries?.brief && (
                  <Button
                    onClick={handleGenerateSummary}
                    loading={generatingSummary}
                    size="sm"
                  >
                    {generatingSummary ? 'Generating...' : '✨ Generate Summary'}
                  </Button>
                )}
              </div>

              {selectedContent.summaries?.brief ? (
                <div>
                  {/* Summary Level Tabs */}
                  <div className="flex gap-2 mb-4 border-b">
                    <button
                      onClick={() => setSummaryLevel('brief')}
                      className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm ${
                        summaryLevel === 'brief'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Quick (2-3 sentences)
                    </button>
                    <button
                      onClick={() => setSummaryLevel('detailed')}
                      className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm ${
                        summaryLevel === 'detailed'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Detailed (5-7 sentences)
                    </button>
                    <button
                      onClick={() => setSummaryLevel('comprehensive')}
                      className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm ${
                        summaryLevel === 'comprehensive'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Comprehensive
                    </button>
                  </div>

                  {/* Summary Content */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedContent.summaries[summaryLevel] || 'Summary not available for this level.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 mb-3">No summary generated yet</p>
                  <p className="text-sm text-gray-500">Click "Generate Summary" to create AI-powered summaries at different detail levels</p>
                </div>
              )}
            </div>

            {/* Content Preview */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3">📖 Original Content Preview:</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border">
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
                  {Math.ceil((selectedContent.originalText?.length || 0) / 500)}
                </p>
                <p className="text-xs text-gray-600">Paragraphs</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {selectedContent.summaries?.brief ? '✅' : '⏳'}
                </p>
                <p className="text-xs text-gray-600">Summary</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowSummary(false)}
                className="flex-1"
              >
                Close
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            📚 Smart Library
          </h1>
          <p className="text-gray-600">Upload and manage your study materials</p>
        </div>

        <Card className="bg-gradient-to-br from-white to-gray-50">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'text'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'file'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📁 File
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'pdf'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 PDF URL
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'youtube'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎥 YouTube
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <Input
              label="Title"
              placeholder="e.g., Biology Chapter 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Text Tab */}
            {activeTab === 'text' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-sm font-bold mb-3 text-gray-700">Content</label>
                <textarea
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors min-h-48 resize-none"
                  placeholder="Paste your study material here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </motion.div>
            )}

            {/* File Upload Tab */}
            {activeTab === 'file' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-sm font-bold mb-3 text-gray-700">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-input"
                    required
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <motion.div
                      className="text-5xl mb-3"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      📁
                    </motion.div>
                    <p className="font-bold text-gray-700 text-lg">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, DOCX, DOC, or TXT (Max 50MB)
                    </p>
                  </label>
                </div>
                {file && (
                  <motion.div
                    className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm text-green-700 font-medium">
                      ✅ File selected: <span className="font-bold">{file.name}</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* PDF Tab */}
            {activeTab === 'pdf' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-sm font-bold mb-3 text-gray-700">PDF URL</label>
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                  <span>📌</span> Paste a direct link to a PDF file. The AI will extract text from it.
                </p>
              </motion.div>
            )}

            {/* YouTube Tab */}
            {activeTab === 'youtube' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-sm font-bold mb-3 text-gray-700">YouTube URL</label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                  <span>📌</span> Paste a YouTube video link. The AI will extract the transcript and create questions.
                </p>
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              <Upload className="w-4 h-4 mr-2 inline" />
              {loading ? 'Uploading...' : 'Upload Material'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {fetchLoading ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600 font-medium">Loading your materials...</p>
        </motion.div>
      ) : contents.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-3xl font-bold">📖 Your Materials</h2>
            <span className="text-sm font-medium px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
              {contents.length} total
            </span>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 border-b overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({contents.length})
            </button>
            <button
              onClick={() => setFilterTab('text')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterTab === 'text'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Text ({contents.filter(c => c.type === 'text').length})
            </button>
            <button
              onClick={() => setFilterTab('pdf')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterTab === 'pdf'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 PDF ({contents.filter(c => c.type === 'pdf').length})
            </button>
            <button
              onClick={() => setFilterTab('youtube')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterTab === 'youtube'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎥 YouTube ({contents.filter(c => c.type === 'youtube').length})
            </button>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contents
              .filter(c => filterTab === 'all' || c.type === filterTab)
              .map((content, idx) => (
              <motion.div
                key={content._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform">
                        {content.type === 'pdf' ? '📄' : content.type === 'youtube' ? '🎥' : '📝'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {content.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize font-medium">
                          {content.type === 'pdf' ? 'PDF' : content.type === 'youtube' ? 'YouTube' : 'Text'}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Bookmark className="w-5 h-5 text-gray-300 hover:text-primary transition-colors" />
                    </motion.div>
                  </div>
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 min-h-10">
                    {content.topics?.join(', ') || 'Processing...'}
                  </p>
                  <div className="flex gap-2">
                    {content.summaries?.brief && (
                      <Button 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedContent(content);
                          setShowSummary(true);
                          setSummaryLevel('brief');
                        }}
                      >
                        📝 View Summary
                      </Button>
                    )}
                    <Button 
                      variant={content.summaries?.brief ? "primary" : "secondary"}
                      className="flex-1"
                      onClick={() => handleGenerateQuiz(content)}
                      disabled={generatingQuizId !== null}
                    >
                      {generatingQuizId === content._id ? '⏳ Generating...' : '✨ Generate Quiz'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-600 font-medium mb-2">No materials yet</p>
            <p className="text-sm text-gray-500">Upload content to get started with quizzes</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
