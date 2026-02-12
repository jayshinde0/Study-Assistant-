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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back, {user?.name}</h1>
        <p className="text-text-secondary">Keep learning and growing every day</p>
      </div>

      {/* Stats Grid - Flat Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'XP Points', value: performance?.user?.xp || 0, icon: Zap },
          { label: 'Study Streak', value: performance?.user?.streak || 0, icon: Flame },
          { label: 'Quizzes Taken', value: performance?.user?.totalQuizzesTaken || 0, icon: BookOpen },
          { label: 'Avg Accuracy', value: `${Math.round(performance?.user?.averageAccuracy || 0)}%`, icon: TrendingUp }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <stat.icon className="w-5 h-5 text-muted flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Materials */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Materials</h2>
        {contents.length > 0 ? (
          <div className="space-y-2">
            {contents.slice(0, 6).map((content, idx) => (
              <div key={content._id} className="bg-white border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{content.title}</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      {content.topics?.slice(0, 3).join(', ') || 'Processing...'}
                    </p>
                  </div>
                  <Button variant="secondary" className="text-xs">
                    Quiz
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg p-8 text-center">
            <p className="text-text-secondary">No materials yet</p>
            <p className="text-xs text-text-secondary mt-1">Upload content to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
