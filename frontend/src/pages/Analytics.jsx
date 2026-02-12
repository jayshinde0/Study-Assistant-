import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import client from '../api/client';
import { BarChart3, TrendingUp, Lightbulb, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

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
        <p className="text-danger mb-4">Error loading analytics: {error}</p>
        <p className="text-text-secondary">Try taking a quiz first to generate analytics data.</p>
      </div>
    );
  }

  if (!performance || (performance.topicStats?.length === 0 && trend.length === 0 && !topicMastery)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">No Analytics Data Yet</h2>
        <p className="text-text-secondary mb-6">Take some quizzes to see your performance analytics!</p>
        <div className="bg-bg-primary rounded-lg p-6 max-w-md mx-auto border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <p className="text-text-primary font-semibold">How to Generate Analytics:</p>
          </div>
          <ol className="text-left text-text-secondary text-sm space-y-2">
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
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-text-primary">Your Learning Analytics</h1>
        </div>
        <p className="text-text-secondary">Track your progress and master topics</p>
      </motion.div>

      {/* User Stats */}
      {performance?.user && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-border">
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">Total Quizzes</p>
            <p className="text-3xl font-semibold text-text-primary mt-2">{performance.user.totalQuizzesTaken}</p>
          </Card>
          <Card className="bg-white border-border">
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">Average Accuracy</p>
            <p className="text-3xl font-semibold text-primary mt-2">{Math.round(performance.user.averageAccuracy)}%</p>
          </Card>
          <Card className="bg-white border-border">
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">XP Earned</p>
            <p className="text-3xl font-semibold text-text-primary mt-2">{performance.user.xp}</p>
          </Card>
          <Card className="bg-white border-border">
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">Current Streak</p>
            <p className="text-3xl font-semibold text-text-primary mt-2">{performance.user.streak}</p>
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
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-text-primary">Topic Mastery (Adaptive Learning)</h2>
          </div>
          
          {/* Recommendation Banner */}
          {recommendations && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-bg-primary border-l-4 border-primary shadow-soft">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-text-secondary font-medium mb-1 uppercase tracking-wide">Personalized Recommendation</p>
                    <p className="text-lg font-semibold text-text-primary mb-3">{recommendations.recommendation}</p>
                    {recommendations.weakTopics?.length > 0 && (
                      <p className="text-sm text-text-secondary mb-2">
                        <AlertCircle className="w-4 h-4 inline mr-1 text-danger" />
                        Focus on: <span className="font-medium text-text-primary">{recommendations.weakTopics.join(', ')}</span>
                      </p>
                    )}
                    {recommendations.revisionTopics?.length > 0 && (
                      <p className="text-sm text-text-secondary">
                        <AlertTriangle className="w-4 h-4 inline mr-1 text-warning" />
                        Review: <span className="font-medium text-text-primary">{recommendations.revisionTopics.join(', ')}</span>
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
                    <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {contentTitle}
                    </h3>

                    {/* Weak Topics for this section */}
                    {contentTopics.some(t => t.accuracy < 50) && (
                      <Card className="border-l-4 border-danger bg-white">
                        <h4 className="font-semibold text-danger mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Weak Topics (Need Practice)
                        </h4>
                        <div className="space-y-2">
                          {contentTopics
                            .filter(t => t.accuracy < 50)
                            .map((topic, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border hover:shadow-soft transition-shadow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <span className="font-medium text-text-primary">{topic.topic}</span>
                                <span className="text-danger font-semibold text-lg">{topic.accuracy.toFixed(1)}%</span>
                              </motion.div>
                            ))}
                        </div>
                      </Card>
                    )}

                    {/* Medium Topics for this section */}
                    {contentTopics.some(t => t.accuracy >= 50 && t.accuracy <= 80) && (
                      <Card className="border-l-4 border-warning bg-white">
                        <h4 className="font-semibold text-warning mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Medium Topics (Keep Practicing)
                        </h4>
                        <div className="space-y-2">
                          {contentTopics
                            .filter(t => t.accuracy >= 50 && t.accuracy <= 80)
                            .map((topic, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border hover:shadow-soft transition-shadow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <span className="font-medium text-text-primary">{topic.topic}</span>
                                <span className="text-warning font-semibold text-lg">{topic.accuracy.toFixed(1)}%</span>
                              </motion.div>
                            ))}
                        </div>
                      </Card>
                    )}

                    {/* Strong Topics for this section */}
                    {contentTopics.some(t => t.accuracy > 80) && (
                      <Card className="border-l-4 border-success bg-white">
                        <h4 className="font-semibold text-success mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Strong Topics (Mastered)
                        </h4>
                        <div className="space-y-2">
                          {contentTopics
                            .filter(t => t.accuracy > 80)
                            .map((topic, idx) => (
                              <motion.div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border hover:shadow-soft transition-shadow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <span className="font-medium text-text-primary">{topic.topic}</span>
                                <span className="text-success font-semibold text-lg">{topic.accuracy.toFixed(1)}%</span>
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
            <Card className="border-l-4 border-primary bg-white">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Topics Due for Revision
              </h3>
              <div className="space-y-2">
                {topicMastery.revisionDue.map((topic, idx) => (
                  <motion.div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <span className="font-medium text-text-primary">{topic.topic}</span>
                    <span className="text-xs text-primary font-medium bg-bg-primary px-3 py-1 rounded-full border border-border">
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
        <hr className="my-8 border-border" />
      )}

      {/* Charts */}
      {performance?.topicStats && performance.topicStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-border">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-text-primary">Topic-wise Performance</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance.topicStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="accuracy" fill="#2c3e50" radius={[8, 8, 0, 0]} />
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
          <Card className="bg-white border-border">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-text-primary">Progress Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="averageAccuracy" stroke="#2c3e50" strokeWidth={3} dot={{ fill: '#2c3e50', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
