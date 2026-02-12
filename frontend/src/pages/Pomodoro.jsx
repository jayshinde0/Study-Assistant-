import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';
import { Clock, Coffee, RotateCcw, Play, Pause } from 'lucide-react';

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
    try {
      const res = await client.post('/study-sessions/start', {
        topic: selectedTopic || 'General Study', // Default to 'General Study' if no topic selected
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
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-text-primary">Pomodoro Timer</h1>
        </div>
        <p className="text-text-secondary">Stay focused and track your study time</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-bg-primary">
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-text-secondary mb-2">
                {isBreak ? 'Break Time' : 'Focus Time'}
              </p>
              <motion.div
                className="text-7xl font-bold text-primary mb-4"
                animate={{ scale: timeLeft <= 10 && isRunning ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: timeLeft <= 10 && isRunning ? Infinity : 0 }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="w-full bg-border rounded-full h-3 mb-4">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {!isRunning && !currentSession && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Select Topic <span className="text-text-secondary text-xs">(Optional)</span>
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="">General Study</option>
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDuration(25); setTimeLeft(25 * 60); setIsBreak(false); }}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${duration === 25 && !isBreak ? 'bg-primary text-white' : 'bg-border text-text-primary hover:bg-border hover:bg-opacity-75'}`}
                  >
                    25 min
                  </button>
                  <button
                    onClick={() => { setDuration(15); setTimeLeft(15 * 60); setIsBreak(false); }}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${duration === 15 && !isBreak ? 'bg-primary text-white' : 'bg-border text-text-primary hover:bg-border hover:bg-opacity-75'}`}
                  >
                    15 min
                  </button>
                  <button
                    onClick={() => { setDuration(5); setTimeLeft(5 * 60); setIsBreak(true); }}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${duration === 5 && isBreak ? 'bg-primary text-white' : 'bg-border text-text-primary hover:bg-border hover:bg-opacity-75'}`}
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
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2 inline" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2 inline" />
                      Resume
                    </>
                  )}
                </Button>
                <Button onClick={resetTimer} variant="secondary">
                  <RotateCcw className="w-4 h-4 mr-2 inline" />
                  Reset
                </Button>
              </div>
            )}
          </Card>

          {todayStats && (
            <Card>
              <h3 className="text-xl font-bold mb-4">Today's Progress</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-bg-primary rounded-lg p-4 text-center border-2 border-border">
                  <p className="text-3xl font-bold text-primary">{todayStats.totalMinutes}</p>
                  <p className="text-sm text-text-secondary">Minutes</p>
                </div>
                <div className="bg-bg-primary rounded-lg p-4 text-center border-2 border-border">
                  <p className="text-3xl font-bold text-success">{todayStats.sessionsCompleted}</p>
                  <p className="text-sm text-text-secondary">Sessions</p>
                </div>
              </div>
              {todayStats.byTopic && todayStats.byTopic.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">By Topic:</p>
                  {todayStats.byTopic.map(item => (
                    <div key={item.topic} className="flex justify-between items-center py-2 border-b border-border">
                      <span className="font-medium">{item.topic}</span>
                      <span className="text-sm text-text-secondary">{item.minutes} min</span>
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
              <h3 className="text-xl font-bold mb-4">Weekly Progress</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyStats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#2c3e50" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-bg-primary rounded-lg p-3 text-center border-2 border-border">
                  <p className="text-2xl font-bold text-primary">{weeklyStats.totalMinutes}</p>
                  <p className="text-xs text-text-secondary">Total Minutes</p>
                </div>
                <div className="bg-bg-primary rounded-lg p-3 text-center border-2 border-border">
                  <p className="text-2xl font-bold text-primary">{weeklyStats.sessionsCompleted}</p>
                  <p className="text-xs text-text-secondary">Total Sessions</p>
                </div>
              </div>
            </Card>
          )}

          {weeklyStats && weeklyStats.byTopic && weeklyStats.byTopic.length > 0 && (
            <Card>
              <h3 className="text-xl font-bold mb-4">Top Topics This Week</h3>
              <div className="space-y-3">
                {weeklyStats.byTopic.slice(0, 5).map((item, idx) => (
                  <div key={item.topic} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-sm text-text-secondary">{item.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{item.minutes}</p>
                      <p className="text-xs text-text-secondary">minutes</p>
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
