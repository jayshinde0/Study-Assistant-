import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Search, AlertTriangle, AlertCircle, User, TrendingUp, Clock, BarChart3, Users } from 'lucide-react';

export const Compare = () => {
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await client.get(`/comparison/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCompare = async (targetUsername) => {
    setLoading(true);
    setError(null);
    setComparison(null);

    try {
      const res = await client.post('/comparison/compare', { username: targetUsername });
      setComparison(res.data.data);
      setSearchResults([]);
      setUsername('');
    } catch (error) {
      console.error('Comparison failed:', error);
      setError(error.response?.data?.error?.message || 'Failed to compare users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;

    setUpdatingUsername(true);
    try {
      await client.put('/comparison/username', { username: newUsername });
      alert('Username updated successfully!');
      setShowUsernameModal(false);
      setNewUsername('');
      // Refresh user data
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to update username');
    } finally {
      setUpdatingUsername(false);
    }
  };

  // Merge trend data for comparison chart
  const getMergedTrendData = () => {
    if (!comparison) return [];

    const dateMap = new Map();

    comparison.currentUser.trend.forEach(item => {
      dateMap.set(item.date, { 
        date: item.date, 
        you: item.averageAccuracy,
        youStudyHours: item.studyHours || 0
      });
    });

    comparison.targetUser.trend.forEach(item => {
      const existing = dateMap.get(item.date) || { date: item.date, you: 0, youStudyHours: 0 };
      existing.friend = item.averageAccuracy;
      existing.friendStudyHours = item.studyHours || 0;
      dateMap.set(item.date, existing);
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  const getStudyHoursData = () => {
    if (!comparison) return [];

    const dateMap = new Map();

    comparison.currentUser.trend.forEach(item => {
      if (item.studyHours > 0) {
        dateMap.set(item.date, { 
          date: item.date, 
          you: item.studyHours
        });
      }
    });

    comparison.targetUser.trend.forEach(item => {
      if (item.studyHours > 0) {
        const existing = dateMap.get(item.date) || { date: item.date, you: 0 };
        existing.friend = item.studyHours;
        dateMap.set(item.date, existing);
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-text-primary">Compare Progress</h1>
        </div>
        <p className="text-text-secondary">See how you stack up against your friends!</p>
      </div>

      {/* Username Setup */}
      {!currentUser?.username && (
        <Card className="bg-warning bg-opacity-10 border-2 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-bold text-lg">Set Your Username</h3>
              </div>
              <p className="text-sm text-text-secondary">You need a username before others can compare with you</p>
            </div>
            <Button onClick={() => setShowUsernameModal(true)}>
              Set Username
            </Button>
          </div>
        </Card>
      )}

      {/* Your Username Display */}
      {currentUser?.username && (
        <Card className="bg-bg-primary border-2 border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">Your Username</p>
              <p className="text-2xl font-bold text-text-primary">@{currentUser.username}</p>
              <p className="text-xs text-text-secondary mt-1">Share this with friends to let them compare with you</p>
            </div>
            <Button variant="secondary" onClick={() => setShowUsernameModal(true)}>
              Change
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Compare */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Find a Friend</h2>
        </div>
        <div className="relative">
          <Input
            placeholder="Search by username or name..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleCompare(user.username)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-primary border-b border-border last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-text-primary">{user.name}</p>
                      <p className="text-sm text-text-secondary">@{user.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{user.xp} XP</p>
                      <p className="text-xs text-text-secondary">{user.totalQuizzes} quizzes</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {searching && (
          <p className="text-sm text-text-secondary mt-2">Searching...</p>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Comparing progress...</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-danger bg-opacity-10 border-2 border-danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            <p className="text-danger font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{comparison.currentUser.name}</h3>
                <p className="text-sm opacity-90">@{comparison.currentUser.username}</p>
              </div>
              <div className="text-3xl">VS</div>
              <div className="text-right">
                <h3 className="text-2xl font-bold mb-1">{comparison.targetUser.name}</h3>
                <p className="text-sm opacity-90">@{comparison.targetUser.username}</p>
              </div>
            </div>
          </Card>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current User Profile */}
            <div>
              <Card className="bg-bg-primary border-2 border-border">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">{comparison.currentUser.name}</h3>
                  <p className="text-sm text-text-secondary">@{comparison.currentUser.username}</p>
                </div>
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Total XP</span>
                    <span className="font-bold text-primary">{comparison.currentUser.stats.xp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Accuracy</span>
                    <span className="font-bold text-success">{Math.round(comparison.currentUser.stats.averageAccuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Quizzes Taken</span>
                    <span className="font-bold text-primary">{comparison.currentUser.stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Current Streak</span>
                    <span className="font-bold text-warning">{comparison.currentUser.stats.streak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Study Hours</span>
                    <span className="font-bold text-primary">{comparison.currentUser.stats.totalStudyHours || 0}h</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Target User Profile */}
            <div>
              <Card className="bg-bg-primary border-2 border-border">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">{comparison.targetUser.name}</h3>
                  <p className="text-sm text-text-secondary">@{comparison.targetUser.username}</p>
                </div>
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Total XP</span>
                    <span className="font-bold text-success">{comparison.targetUser.stats.xp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Accuracy</span>
                    <span className="font-bold text-success">{Math.round(comparison.targetUser.stats.averageAccuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Quizzes Taken</span>
                    <span className="font-bold text-primary">{comparison.targetUser.stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Current Streak</span>
                    <span className="font-bold text-warning">{comparison.targetUser.stats.streak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">Study Hours</span>
                    <span className="font-bold text-primary">{comparison.targetUser.stats.totalStudyHours || 0}h</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* View Full Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate(`/profile/${comparison.currentUser.username}`)}
              className="w-full"
            >
              View {comparison.currentUser.name}'s Full Profile
            </Button>
            <Button
              onClick={() => navigate(`/profile/${comparison.targetUser.username}`)}
              className="w-full"
            >
              View {comparison.targetUser.name}'s Full Profile
            </Button>
          </div>

          {/* Progress Trend Comparison */}
          {getMergedTrendData().length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Progress Over Time</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMergedTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="you" 
                    stroke="#2c3e50" 
                    name="You"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="friend" 
                    stroke="#10B981" 
                    name={comparison.targetUser.name}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Study Hours Comparison */}
          {getStudyHoursData().length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Study Hours Comparison</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getStudyHoursData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="you" 
                    stroke="#2c3e50" 
                    name="Your Study Hours"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="friend" 
                    stroke="#27ae60" 
                    name={`${comparison.targetUser.name}'s Study Hours`}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-bg-primary rounded-lg p-3 text-center border-2 border-border">
                  <p className="text-2xl font-bold text-primary">
                    {comparison.currentUser.stats.totalStudyHours || 0}h
                  </p>
                  <p className="text-xs text-text-secondary">Your Total Study Time</p>
                </div>
                <div className="bg-bg-primary rounded-lg p-3 text-center border-2 border-border">
                  <p className="text-2xl font-bold text-success">
                    {comparison.targetUser.stats.totalStudyHours || 0}h
                  </p>
                  <p className="text-xs text-text-secondary">{comparison.targetUser.name}'s Total</p>
                </div>
              </div>
            </Card>
          )}

          {/* Topic Comparison */}
          {comparison.topicComparison.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Topic-wise Comparison</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparison.topicComparison.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="user1Accuracy" fill="#2c3e50" name="You" />
                  <Bar dataKey="user2Accuracy" fill="#10B981" name={comparison.targetUser.name} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Set Your Username</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose a unique username (3-20 characters, letters, numbers, and underscores only)
            </p>
            <Input
              placeholder="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowUsernameModal(false);
                  setNewUsername('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUsername}
                loading={updatingUsername}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
