import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          👥 Compare Progress
        </h1>
        <p className="text-gray-600">See how you stack up against your friends!</p>
      </div>

      {/* Username Setup */}
      {!currentUser?.username && (
        <Card className="bg-yellow-50 border-2 border-yellow-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">⚠️ Set Your Username</h3>
              <p className="text-sm text-gray-600">You need a username before others can compare with you</p>
            </div>
            <Button onClick={() => setShowUsernameModal(true)}>
              Set Username
            </Button>
          </div>
        </Card>
      )}

      {/* Your Username Display */}
      {currentUser?.username && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Username</p>
              <p className="text-2xl font-bold">@{currentUser.username}</p>
              <p className="text-xs text-gray-500 mt-1">Share this with friends to let them compare with you</p>
            </div>
            <Button variant="secondary" onClick={() => setShowUsernameModal(true)}>
              Change
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Compare */}
      <Card>
        <h2 className="text-xl font-bold mb-4">🔍 Find a Friend</h2>
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
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleCompare(user.username)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{user.xp} XP</p>
                      <p className="text-xs text-gray-500">{user.totalQuizzes} quizzes</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {searching && (
          <p className="text-sm text-gray-500 mt-2">Searching...</p>
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
        <Card className="bg-red-50 border-2 border-red-300">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </Card>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{comparison.currentUser.name}</h3>
                <p className="text-sm opacity-90">@{comparison.currentUser.username}</p>
              </div>
              <div className="text-4xl">🆚</div>
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
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-3">
                    👤
                  </div>
                  <h3 className="text-xl font-bold">{comparison.currentUser.name}</h3>
                  <p className="text-sm text-gray-600">@{comparison.currentUser.username}</p>
                </div>
                <div className="space-y-3 border-t border-blue-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total XP</span>
                    <span className="font-bold text-primary">{comparison.currentUser.stats.xp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Accuracy</span>
                    <span className="font-bold text-green-600">{Math.round(comparison.currentUser.stats.averageAccuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Quizzes Taken</span>
                    <span className="font-bold text-blue-600">{comparison.currentUser.stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Current Streak</span>
                    <span className="font-bold text-orange-600">{comparison.currentUser.stats.streak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Study Hours</span>
                    <span className="font-bold text-purple-600">{comparison.currentUser.stats.totalStudyHours || 0}h</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Target User Profile */}
            <div>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-3">
                    👤
                  </div>
                  <h3 className="text-xl font-bold">{comparison.targetUser.name}</h3>
                  <p className="text-sm text-gray-600">@{comparison.targetUser.username}</p>
                </div>
                <div className="space-y-3 border-t border-green-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total XP</span>
                    <span className="font-bold text-green-600">{comparison.targetUser.stats.xp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Accuracy</span>
                    <span className="font-bold text-green-600">{Math.round(comparison.targetUser.stats.averageAccuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Quizzes Taken</span>
                    <span className="font-bold text-blue-600">{comparison.targetUser.stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Current Streak</span>
                    <span className="font-bold text-orange-600">{comparison.targetUser.stats.streak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Study Hours</span>
                    <span className="font-bold text-purple-600">{comparison.targetUser.stats.totalStudyHours || 0}h</span>
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
              <h2 className="text-xl font-bold mb-4">📈 Progress Over Time</h2>
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
                    stroke="#6366F1" 
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
              <h2 className="text-xl font-bold mb-4">⏱️ Study Hours Comparison</h2>
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
                    stroke="#9333EA" 
                    name="Your Study Hours"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="friend" 
                    stroke="#F59E0B" 
                    name={`${comparison.targetUser.name}'s Study Hours`}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {comparison.currentUser.stats.totalStudyHours || 0}h
                  </p>
                  <p className="text-xs text-gray-600">Your Total Study Time</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {comparison.targetUser.stats.totalStudyHours || 0}h
                  </p>
                  <p className="text-xs text-gray-600">{comparison.targetUser.name}'s Total</p>
                </div>
              </div>
            </Card>
          )}

          {/* Topic Comparison */}
          {comparison.topicComparison.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold mb-4">📚 Topic-wise Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparison.topicComparison.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="user1Accuracy" fill="#6366F1" name="You" />
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
