import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import client from '../api/client';

export const Analytics = () => {
  const [performance, setPerformance] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [perfRes, trendRes, recRes] = await Promise.all([
          client.get('/analytics/performance'),
          client.get('/analytics/trend'),
          client.get('/analytics/recommendations')
        ]);
        setPerformance(perfRes.data.data);
        setTrend(trendRes.data.data || []);
        setRecommendations(recRes.data.data || []);
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

  if (!performance || (performance.topicStats?.length === 0 && trend.length === 0)) {
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
      <motion.h1
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your Learning Analytics
      </motion.h1>

      {/* User Stats */}
      {performance?.user && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total Quizzes</p>
            <p className="text-3xl font-bold text-primary">{performance.user.totalQuizzesTaken}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Average Accuracy</p>
            <p className="text-3xl font-bold text-green-600">{Math.round(performance.user.averageAccuracy)}%</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">XP Earned</p>
            <p className="text-3xl font-bold text-blue-600">{performance.user.xp}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">{performance.user.streak}</p>
          </Card>
        </div>
      )}

      {/* Topic Performance */}
      {performance?.topicStats && performance.topicStats.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Topic-wise Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance.topicStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Progress Trend */}
      {trend && trend.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Progress Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageAccuracy" stroke="#6366F1" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <Card key={idx}>
                <h3 className="font-bold text-lg mb-2">{rec.topic}</h3>
                <p className="text-gray-600 text-sm mb-3">{rec.action}</p>
                <p className="text-gray-500 text-xs">{rec.reason}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
