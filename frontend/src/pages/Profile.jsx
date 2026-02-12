import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = username ? `/profile/${username}` : '/profile';
      const res = await client.get(endpoint);
      setProfile(res.data.data);
      setEditData(res.data.data);
      
      if (res.data.data.followers) {
        setIsFollowing(res.data.data.followers.some(f => f._id === currentUser?.id));
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await client.post(`/api/profile/unfollow/${profile.userId}`);
      } else {
        await client.post(`/api/profile/follow/${profile.userId}`);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (err) {
      console.error('Follow action failed:', err);
      alert('Failed to update follow status');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await client.put('/api/profile', editData);
      setProfile(editData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-2 border-red-300">
        <p className="text-red-800 font-medium">❌ {error}</p>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
      </Card>
    );
  }

  const isOwnProfile = currentUser?.id === profile.userId;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Card className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl">
                {profile.avatar || '👤'}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <p className="text-lg opacity-90">@{profile.username}</p>
                {profile.bio && <p className="text-sm opacity-80 mt-2">{profile.bio}</p>}
                <div className="flex gap-6 mt-4 text-sm">
                  <div>
                    <p className="font-bold text-xl">{profile.followers?.length || 0}</p>
                    <p className="opacity-75">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold text-xl">{profile.following?.length || 0}</p>
                    <p className="opacity-75">Following</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!isOwnProfile && (
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? 'secondary' : 'primary'}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              {isOwnProfile && (
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? 'secondary' : 'primary'}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-600 mb-2">Total XP</p>
          <p className="text-3xl font-bold text-primary">{profile.totalXP || 0}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600 mb-2">Accuracy</p>
          <p className="text-3xl font-bold text-green-600">{Math.round(profile.averageAccuracy || 0)}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600 mb-2">Quizzes</p>
          <p className="text-3xl font-bold text-blue-600">{profile.totalQuizzesTaken || 0}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600 mb-2">Streak</p>
          <p className="text-3xl font-bold text-orange-600">{profile.currentStreak || 0}</p>
        </Card>
      </div>

      {/* Study Statistics */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">📊 Study Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Study Hours</p>
            <p className="text-2xl font-bold">{profile.totalStudyHours || 0}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Topics Studied</p>
            <p className="text-2xl font-bold">{profile.topicsStudied || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Topics Mastered</p>
            <p className="text-2xl font-bold text-green-600">{profile.topicsMastered || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Longest Streak</p>
            <p className="text-2xl font-bold">{profile.longestStreak || 0} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Avg Quiz Score</p>
            <p className="text-2xl font-bold">{Math.round(profile.averageQuizScore || 0)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Member Since</p>
            <p className="text-sm font-bold">{new Date(profile.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold mb-6">🏆 Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.badges.map((badge, idx) => (
              <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 text-center border-2 border-yellow-200">
                <p className="text-3xl mb-2">{badge.icon || '⭐'}</p>
                <p className="font-bold text-sm">{badge.name}</p>
                <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Followers */}
      {profile.followers && profile.followers.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold mb-6">👥 Followers ({profile.followers.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.followers.map((follower) => (
              <div key={follower._id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-bold">{follower.name}</p>
                  <p className="text-sm text-gray-600">@{follower.username}</p>
                </div>
                <button
                  onClick={() => navigate(`/profile/${follower.username}`)}
                  className="text-primary hover:text-secondary font-medium text-sm"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Following */}
      {profile.following && profile.following.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold mb-6">🔗 Following ({profile.following.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.following.map((followingUser) => (
              <div key={followingUser._id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 flex items-center justify-between">
                <div>
                  <p className="font-bold">{followingUser.name}</p>
                  <p className="text-sm text-gray-600">@{followingUser.username}</p>
                </div>
                <button
                  onClick={() => navigate(`/profile/${followingUser.username}`)}
                  className="text-primary hover:text-secondary font-medium text-sm"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Profile Modal */}
      {editMode && isOwnProfile && (
        <Card className="bg-blue-50 border-2 border-blue-300">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={editData.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary"
                rows="3"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Learning Style</label>
              <select
                value={editData.learningStyle || 'Mixed'}
                onChange={(e) => setEditData({ ...editData, learningStyle: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary"
              >
                <option>Visual</option>
                <option>Auditory</option>
                <option>Kinesthetic</option>
                <option>Reading</option>
                <option>Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">School</label>
              <input
                type="text"
                value={editData.school || ''}
                onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary"
                placeholder="Your school name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Grade</label>
              <input
                type="text"
                value={editData.grade || ''}
                onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary"
                placeholder="Your grade/year"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setEditMode(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
