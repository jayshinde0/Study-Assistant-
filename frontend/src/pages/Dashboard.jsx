import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [performance, setPerformance] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, contentsRes] = await Promise.all([
          client.get('/analytics/performance'),
          client.get('/content')
        ]);
        setPerformance(perfRes.data.data);
        setContents(contentsRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <motion.div
        className="bg-gradient-to-br from-primary via-secondary to-purple-600 text-white rounded-2xl p-8 shadow-lg overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-lg opacity-90">Keep learning and growing every day</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex items-center gap-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-yellow-200 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">XP Points</p>
              <p className="text-3xl font-bold text-yellow-700">{performance?.user?.xp || 0}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="flex items-center gap-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-red-200 rounded-lg">
              <Flame className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Study Streak</p>
              <p className="text-3xl font-bold text-red-700">{performance?.user?.streak || 0}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-blue-200 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Quizzes Taken</p>
              <p className="text-3xl font-bold text-blue-700">{performance?.user?.totalQuizzesTaken || 0}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="flex items-center gap-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Accuracy</p>
              <p className="text-3xl font-bold text-green-700">{Math.round(performance?.user?.averageAccuracy || 0)}%</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Materials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">📚 Recent Materials</h2>
          <span className="text-sm text-gray-500">({contents.length} total)</span>
        </div>
        {contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contents.slice(0, 4).map((content, idx) => (
              <motion.div
                key={content._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all hover:scale-105">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">
                      {content.type === 'pdf' ? '📄' : content.type === 'youtube' ? '🎥' : '📝'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg line-clamp-2">{content.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{content.type}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {content.topics?.join(', ') || 'Processing...'}
                  </p>
                  <Button variant="secondary" className="w-full">
                    Start Quiz →
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
            <p className="text-gray-500 mb-3">No materials yet</p>
            <p className="text-sm text-gray-400">Upload content to get started</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
};
