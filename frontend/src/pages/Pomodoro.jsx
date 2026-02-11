import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';

export const Pomodoro = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);

  useEffect(() => {
    fetchTopics();
    fetchTodayStats();
    fetchWeeklyStats();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(time => time - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const fetchTopics = async () => {
    try {
      const res = await client.get('/study-sessions/topics');
      setTopics(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const res = await client.get('/study-sessions/stats/today');
      setTodayStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch today stats:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const res = await client.get('/study-sessions/stats/weekly');
      setWeeklyStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
    }
  };

  const startTimer = async () => {
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    try {
      const res = await client.post('/study-sessions/start', {
        topic: selectedTopic,
        duration,
        type: isBreak ? 'break' : 'focus'
      });
      setCurrentSession(res.data.data);
      setTimeLeft(duration * 60);
      setIsRunning(true);
    } catch (error) {
      alert('Failed to start session');
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (currentSession) {
      try {
        await client.post(`/study-sessions/${currentSession._id}/complete`);
        fetchTodayStats();
        fetchWeeklyStats();
        alert(isBreak ? 'Break complete! Ready to focus?' : 'Session complete! Take a break?');
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    }
    
    setIsBreak(!isBreak);
    setDuration(isBreak ? 25 : 5);
    setTimeLeft((isBreak ? 25 : 5) * 60);
    setCurrentSession(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setCurrentSession(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          ⏱️ Pomodoro Timer
        </h1>
        <p className="text-gray-600">Stay focused and track your study time</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                {isBreak ? '☕ Break Time' : '📚 Focus Time'}
              </p>
              <motion.div
                className="text-7xl font-bold text-primary mb-4"
                animate={{ scale: timeLeft <= 10 && isRunning ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: timeLeft <= 10 && isRunning ? Infinity : 0 }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {!isRunning && !currentSession && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="">Choose a topic...</option>
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDuration(25); setTimeLeft(25 * 60); setIsBreak(false); }}
                    className={`flex-1 py-2 rounded-lg font-medium ${duration === 25 && !isBreak ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  >
                    25 min
                  </button>
                  <button
                    onClick={() => { setDuration(15); setTimeLeft(15 * 60); setIsBreak(false); }}
                    className={`flex-1 py-2 rounded-lg font-medium ${duration === 15 && !isBreak ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  >
                    15 min
                  </button>
                  <button
                    onClick={() => { setDuration(5); setTimeLeft(5 * 60); setIsBreak(true); }}
                    className={`flex-1 py-2 rounded-lg font-medium ${duration === 5 && isBreak ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  >
                    5 min
                  </button>
                </div>
                <Button onClick={startTimer} className="w-full">
                  Start {isBreak ? 'Break' : 'Focus'}
                </Button>
              </div>
            )}

            {currentSession && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? 'secondary' : 'primary'}
                  className="flex-1"
                >
                  {isRunning ? '⏸️ Pause' : '▶️ Resume'}
                </Button>
                <Button onClick={resetTimer} variant="secondary">
                  🔄 Reset
                </Button>
              </div>
            )}
          </Card>

          {todayStats && (
            <Card>
              <h3 className="text-xl font-bold mb-4">📊 Today's Progress</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{todayStats.totalMinutes}</p>
                  <p className="text-sm text-gray-600">Minutes</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{todayStats.sessionsCompleted}</p>
                  <p className="text-sm text-gray-600">Sessions</p>
                </div>
              </div>
              {todayStats.byTopic && todayStats.byTopic.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">By Topic:</p>
                  {todayStats.byTopic.map(item => (
                    <div key={item.topic} className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">{item.topic}</span>
                      <span className="text-sm text-gray-600">{item.minutes} min</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {weeklyStats && weeklyStats.dailyData && (
            <Card>
              <h3 className="text-xl font-bold mb-4">📈 Weekly Progress</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyStats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{weeklyStats.totalMinutes}</p>
                  <p className="text-xs text-gray-600">Total Minutes</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{weeklyStats.sessionsCompleted}</p>
                  <p className="text-xs text-gray-600">Total Sessions</p>
                </div>
              </div>
            </Card>
          )}

          {weeklyStats && weeklyStats.byTopic && weeklyStats.byTopic.length > 0 && (
            <Card>
              <h3 className="text-xl font-bold mb-4">📚 Top Topics This Week</h3>
              <div className="space-y-3">
                {weeklyStats.byTopic.slice(0, 5).map((item, idx) => (
                  <div key={item.topic} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-sm text-gray-600">{item.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{item.minutes}</p>
                      <p className="text-xs text-gray-600">minutes</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
