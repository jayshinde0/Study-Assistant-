import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';
import { ExternalLink, Play, FileText, BookOpen } from 'lucide-react';

export const LearningPath = () => {
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicDetails, setTopicDetails] = useState(null);
  const [resources, setResources] = useState(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      const res = await client.get('/learning-path');
      setPathData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicDetails = async (topic) => {
    try {
      const res = await client.get(`/learning-path/topic/${encodeURIComponent(topic)}`);
      setTopicDetails(res.data.data);
    } catch (error) {
      console.error('Failed to fetch topic details:', error);
    }
  };

  const fetchResources = async (topic) => {
    try {
      setResourcesLoading(true);
      const res = await client.get(`/resources/topic/${encodeURIComponent(topic)}`);
      setResources(res.data.data.resources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setResources(null);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setResources(null);
    fetchTopicDetails(topic.topic);
    fetchResources(topic.topic);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'struggling': return 'bg-red-100 text-red-800 border-red-300';
      case 'not-started': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'mastered': return '✅';
      case 'in-progress': return '📚';
      case 'struggling': return '⚠️';
      case 'not-started': return '⭕';
      default: return '⭕';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'text-purple-600';
      case 'intermediate': return 'text-blue-600';
      case 'beginner': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-gray-600">Loading your learning path...</p>
      </div>
    );
  }

  if (!pathData || pathData.totalTopics === 0) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <div className="text-5xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold mb-4">No Learning Path Yet</h2>
          <p className="text-gray-600 mb-6">
            Upload study materials and take quizzes to generate your personalized learning roadmap!
          </p>
          <Button onClick={() => window.location.href = '/content'}>
            Upload Content
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          🗺️ Your Learning Path
        </h1>
        <p className="text-gray-600">Personalized roadmap based on your progress</p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary">{pathData.totalTopics}</p>
          <p className="text-sm text-gray-600">Total Topics</p>
        </Card>
        <Card className="text-center bg-green-50">
          <p className="text-3xl font-bold text-green-600">{pathData.masteredTopics}</p>
          <p className="text-sm text-gray-600">Mastered</p>
        </Card>
        <Card className="text-center bg-blue-50">
          <p className="text-3xl font-bold text-blue-600">{pathData.inProgressTopics}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </Card>
        <Card className="text-center bg-red-50">
          <p className="text-3xl font-bold text-red-600">{pathData.strugglingTopics}</p>
          <p className="text-sm text-gray-600">Need Review</p>
        </Card>
      </div>

      {/* Next Recommended */}
      {pathData.nextRecommended && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">🎯 Next Recommended</p>
                <h3 className="text-2xl font-bold">{pathData.nextRecommended.topic}</h3>
                <p className="text-sm opacity-90 mt-2">
                  {pathData.nextRecommended.prerequisites.length > 0 
                    ? `Prerequisites: ${pathData.nextRecommended.prerequisites.join(', ')}`
                    : 'No prerequisites - Start anytime!'}
                </p>
              </div>
              <Button 
                variant="secondary"
                onClick={() => handleTopicClick(pathData.nextRecommended)}
              >
                Start Learning
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Learning Path Roadmap */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📊 Your Roadmap</h2>
        
        {/* Completed Topics Section */}
        {pathData.path.filter(t => t.accuracy === 100).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✅</span>
              <h3 className="text-lg font-bold text-green-700">
                Completed Topics ({pathData.path.filter(t => t.accuracy === 100).length})
              </h3>
            </div>
            <div className="space-y-3 bg-green-50 rounded-lg p-4 border-2 border-green-200">
              {pathData.path.filter(t => t.accuracy === 100).map((topic, idx) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-lg transition-all bg-white ${
                      selectedTopic?.topic === topic.topic ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className="text-4xl">✅</div>

                      {/* Topic Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{topic.topic}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                            MASTERED
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            Expert
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {topic.attempts > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-green-500"
                                style={{ width: '100%' }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              100%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({topic.attempts} attempts)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining Topics Section */}
        {pathData.path.filter(t => t.accuracy < 100).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📚</span>
              <h3 className="text-lg font-bold text-blue-700">
                Topics to Master ({pathData.path.filter(t => t.accuracy < 100).length})
              </h3>
            </div>
            <div className="space-y-3">
              {pathData.path.filter(t => t.accuracy < 100).map((topic, idx) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-lg transition-all ${
                      selectedTopic?.topic === topic.topic ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className="text-4xl">{getStatusIcon(topic.status)}</div>

                      {/* Topic Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{topic.topic}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(topic.status)}`}>
                            {topic.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`text-sm font-medium ${getLevelColor(topic.level)}`}>
                            {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
                          </span>
                        </div>

                        {/* Prerequisites */}
                        {topic.prerequisites.length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            📋 Prerequisites: {topic.prerequisites.join(', ')}
                          </p>
                        )}

                        {/* Progress Bar */}
                        {topic.attempts > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  topic.accuracy >= 90 ? 'bg-green-500' :
                                  topic.accuracy >= 70 ? 'bg-blue-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${topic.accuracy}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {topic.accuracy}%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({topic.attempts} attempts)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Recommended Badge */}
                      {topic.recommended && (
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                          ⭐ Recommended
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Topic Details Modal */}
      {selectedTopic && topicDetails && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedTopic(null)}
        >
          <Card 
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{topicDetails.topic}</h2>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{topicDetails.accuracy}%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{topicDetails.correctAnswers}</p>
                  <p className="text-xs text-gray-600">Correct</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{topicDetails.totalQuestions}</p>
                  <p className="text-xs text-gray-600">Total Questions</p>
                </div>
              </div>

              {/* Related Content */}
              {topicDetails.relatedContent.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">📚 Related Study Materials</h3>
                  <div className="space-y-2">
                    {topicDetails.relatedContent.map(content => (
                      <div key={content.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-2xl">
                          {content.type === 'pdf' ? '📄' : content.type === 'youtube' ? '🎥' : '📝'}
                        </span>
                        <span className="font-medium">{content.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Learning Resources */}
              {resourcesLoading && (
                <div className="mb-6 text-center py-4">
                  <motion.div
                    className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-sm text-gray-600 mt-2">Loading resources...</p>
                </div>
              )}

              {resources && (
                <div className="mb-6 space-y-4">
                  {/* Videos */}
                  {resources.videos && resources.videos.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Play className="w-5 h-5 text-red-600" />
                        Video Tutorials
                      </h3>
                      <div className="space-y-2">
                        {resources.videos.slice(0, 3).map((video, idx) => (
                          <a
                            key={idx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-16 h-12 rounded object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{video.channel}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                                    {video.platform}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-gray-500" />
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  {resources.articles && resources.articles.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Articles & Documentation
                      </h3>
                      <div className="space-y-2">
                        {resources.articles.slice(0, 3).map((article, idx) => (
                          <a
                            key={idx}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{article.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                    {article.platform}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-gray-500" />
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courses */}
                  {resources.courses && resources.courses.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-green-600" />
                        Online Courses
                      </h3>
                      <div className="space-y-2">
                        {resources.courses.slice(0, 3).map((course, idx) => (
                          <a
                            key={idx}
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{course.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{course.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                    {course.platform}
                                  </span>
                                  {course.level && (
                                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                                      {course.level}
                                    </span>
                                  )}
                                  <ExternalLink className="w-3 h-3 text-gray-500" />
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Questions */}
              {topicDetails.recentQuestions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">📝 Recent Questions</h3>
                  <div className="space-y-2">
                    {topicDetails.recentQuestions.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-xl">{q.isCorrect ? '✅' : '❌'}</span>
                        <span className="text-sm flex-1">{q.question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setSelectedTopic(null)} className="flex-1">
                Close
              </Button>
              <Button onClick={() => window.location.href = '/content'} className="flex-1">
                Study This Topic
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
