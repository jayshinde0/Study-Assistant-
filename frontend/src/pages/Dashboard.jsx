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
        className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-lg opacity-90">Keep learning and growing every day</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <Zap className="w-8 h-8 text-warning" />
          <div>
            <p className="text-gray-600 text-sm">XP Points</p>
            <p className="text-2xl font-bold">{performance?.user?.xp || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <Flame className="w-8 h-8 text-error" />
          <div>
            <p className="text-gray-600 text-sm">Study Streak</p>
            <p className="text-2xl font-bold">{performance?.user?.streak || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <p className="text-gray-600 text-sm">Quizzes Taken</p>
            <p className="text-2xl font-bold">{performance?.user?.totalQuizzesTaken || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-success" />
          <div>
            <p className="text-gray-600 text-sm">Avg Accuracy</p>
            <p className="text-2xl font-bold">{Math.round(performance?.user?.averageAccuracy || 0)}%</p>
          </div>
        </Card>
      </div>

      {/* Recent Materials */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contents.slice(0, 4).map((content) => (
            <Card key={content._id}>
              <h3 className="font-bold text-lg mb-2">{content.title}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {content.topics?.join(', ') || 'No topics'}
              </p>
              <Button variant="secondary" className="w-full">
                Start Quiz
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
