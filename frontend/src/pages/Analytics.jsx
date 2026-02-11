import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import client from '../api/client';

export const Analytics = () => {
  const [performance, setPerformance] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [topicMastery, setTopicMastery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [perfRes, trendRes, recRes, masteryRes] = await Promise.all([
          client.get('/analytics/performance'),
          client.get('/analytics/trend'),
          client.get('/analytics/recommendations'),
          client.get('/analytics/topic-mastery')
        ]);
        setPerformance(perfRes.data.data);
        setTrend(trendRes.data.data || []);
        setRecommendations(recRes.data.data);
        setTopicMastery(masteryRes.data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-12">Loading analytics...</div>;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
        <p className="text-gray-600">Try taking a quiz first to generate analytics data.</p>
      </div>
    );
  }

  if (!performance || (performance.topicStats?.length === 0 && trend.length === 0 && !topicMastery)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Analytics Data Yet</h2>
        <p className="text-gray-600 mb-6">Take some quizzes to see your performance analytics!</p>
        <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-blue-800 font-semibold mb-2">📊 How to Generate Analytics:</p>
          <ol className="text-left text-blue-700 text-sm space-y-2">
            <li>1. Go to Content tab</li>
            <li>2. Upload study material</li>
            <li>3. Click "Generate Quiz"</li>
            <li>4. Take the quiz</li>
            <li>5. Come back here to see your analytics!</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          📊 Your Learning Analytics
        </h1>
        <p className="text-gray-600">Track your progress and master topics</p>
      </motion.div>

      {/* User Stats */}
      {performance?.user && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-gray-600 text-sm font-medium">Total Quizzes</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{performance.user.totalQuizzesTaken}</p>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-gray-600 text-sm font-medium">Average Accuracy</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{Math.round(performance.user.averageAccuracy)}%</p>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-gray-600 text-sm font-medium">XP Earned</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{performance.user.xp}</p>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <p className="text-gray-600 text-sm font-medium">Current Streak</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">{performance.user.streak}</p>
          </Card>
        </motion.div>
      )}

      {/* Topic Mastery - Adaptive Learning */}
      {topicMastery && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold">🎯 Topic Mastery (Adaptive Learning)</h2>
          
          {/* Recommendation Banner */}
          {recommendations && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-l-4 border-indigo-500 shadow-lg">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💡</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Personalized Recommendation</p>
                    <p className="text-xl font-bold text-indigo-700 mb-3">{recommendations.recommendation}</p>
                    {recommendations.weakTopics?.length > 0 && (
                      <p className="text-sm text-gray-700 mb-2">
                        🔴 Focus on: <span className="font-semibold text-indigo-600">{recommendations.weakTopics.join(', ')}</span>
                      </p>
                    )}
                    {recommendations.revisionTopics?.length > 0 && (
                      <p className="text-sm text-gray-700">
                        🟡 Review: <span className="font-semibold text-indigo-600">{recommendations.revisionTopics.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Group Topics by Content Section */}
          {performance?.topicStats && performance.topicStats.length > 0 && (
            <div className="space-y-6">
              {Array.from(new Set(performance.topicStats.map(t => t.contentTitle || 'General'))).map((contentTitle, sectionIdx) => {
                const contentTopics = performance.topicStats.filter(t => (t.contentTitle || 'General') === contentTitle);
                
                return (
                  <motion.div
                    key={contentTitle}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + sectionIdx * 0.1 }}
                  >
                    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-primary pb-3 flex items-center gap-2">
                      📚 {contentTitle}
                    </h3>

                    {/* Weak Topics for this section */}
                    {contentTopics.some(t => t.accuracy < 50) && (
                      <Card className="border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-red-100">
                        <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                          🔴 Weak Topics (Need Practice)
                        </h4>
                        <div className="space-y-2">
                          {contentTopics
                            .filter(t => t.accuracy < 50)
                            .map((topic, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <span className="font-medium text-gray-700">{topic.topic}</span>
                                <span className="text-red-600 font-bold text-lg">{topic.accuracy.toFixed(1)}%</span>
                              </motion.div>
                            ))}
                        </div>
                      </Card>
                    )}

                    {/* Medium Topics for this section */}
                    {contentTopics.some(t => t.accuracy >= 50 && t.accuracy <= 80) && (
                      <Card className="border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100">
                        <h4 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
                          🟡 Medium Topics (Keep Practicing)
                        </h4>
                        <div className="space-y-2">
                          {contentTopics
                            .filter(t => t.accuracy >= 50 && t.accuracy <= 80)
                            .map((topic, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <span className="font-medium text-gray-700">{topic.topic}</span>
                                <span className="text-yellow-600 font-bold text-lg">{topic.accuracy.toFixed(1)}%</span>
                              </motion.div>
                            ))}
                        </div>
                      </Card>
                    )}

                    {/* Strong Topics for this section */}
                    {contentTopics.some(t => t.accuracy > 80) && (
                      <Card className="border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-green-100">
                        <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                          🟢 Strong Topics (Mastered)
                        </h4>
                        <div className="space-y-2">
                          {contentTopics
                            .filter(t => t.accuracy > 80)
                            .map((topic, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <span className="font-medium text-gray-700">{topic.topic}</span>
                                <span className="text-green-600 font-bold text-lg">{topic.accuracy.toFixed(1)}%</span>
                              </motion.div>
                            ))}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Revision Due */}
          {topicMastery.revisionDue?.length > 0 && (
            <Card className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100">
              <h3 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                📅 Topics Due for Revision
              </h3>
              <div className="space-y-2">
                {topicMastery.revisionDue.map((topic, idx) => (
                  <motion.div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <span className="font-medium text-gray-700">{topic.topic}</span>
                    <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-3 py-1 rounded-full">
                      {new Date(topic.nextRevisionDate).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Divider */}
      {topicMastery && (performance?.topicStats?.length > 0 || trend.length > 0) && (
        <hr className="my-8 border-gray-200" />
      )}

      {/* Charts */}
      {performance?.topicStats && performance.topicStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold mb-6">📊 Topic-wise Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance.topicStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="accuracy" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Progress Trend */}
      {trend && trend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold mb-6">📈 Progress Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="averageAccuracy" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
