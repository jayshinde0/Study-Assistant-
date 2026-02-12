import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

const populateFollowData = {
  path: 'followers',
  model: 'User',
  select: 'name username avatar'
};

const populateFollowingData = {
  path: 'following',
  model: 'User',
  select: 'name username avatar'
};

export const createOrGetProfile = async (userId) => {
  try {
    let profile = await StudentProfile.findOne({ userId });
    
    if (!profile) {
      const user = await User.findById(userId);
      profile = new StudentProfile({
        userId,
        name: user.name,
        email: user.email,
        username: user.username,
        totalXP: user.xp || 0,
        currentStreak: user.streak || 0,
        totalQuizzesTaken: user.totalQuizzesTaken || 0,
        averageAccuracy: user.averageAccuracy || 0
      });
      await profile.save();
    }
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to create or get profile: ${error.message}`);
  }
};

export const getProfileByUserId = async (userId) => {
  try {
    const profile = await StudentProfile.findOne({ userId })
      .populate(populateFollowData)
      .populate(populateFollowingData);
    
    if (!profile) {
      return await createOrGetProfile(userId);
    }
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to get profile: ${error.message}`);
  }
};

export const getProfileByUsername = async (username) => {
  try {
    const profile = await StudentProfile.findOne({ username })
      .populate(populateFollowData)
      .populate(populateFollowingData);
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to get profile by username: ${error.message}`);
  }
};

export const updateProfile = async (userId, updateData) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { ...updateData, lastActiveAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

export const updateProfileStats = async (userId, stats) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      {
        totalStudyHours: stats.totalStudyHours || 0,
        totalQuizzesTaken: stats.totalQuizzesTaken || 0,
        averageAccuracy: stats.averageAccuracy || 0,
        currentStreak: stats.currentStreak || 0,
        longestStreak: stats.longestStreak || 0,
        totalXP: stats.totalXP || 0,
        topicsStudied: stats.topicsStudied || 0,
        topicsMastered: stats.topicsMastered || 0,
        averageQuizScore: stats.averageQuizScore || 0,
        lastActiveAt: new Date()
      },
      { new: true }
    );
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to update profile stats: ${error.message}`);
  }
};

export const followUser = async (followerId, followingId) => {
  try {
    const followerProfile = await StudentProfile.findOne({ userId: followerId });
    const followingProfile = await StudentProfile.findOne({ userId: followingId });
    
    if (!followerProfile || !followingProfile) {
      throw new Error('One or both profiles not found');
    }
    
    // Add to following list (store userId, not profile ID)
    if (!followerProfile.following.some(id => id.toString() === followingId.toString())) {
      followerProfile.following.push(followingId);
      await followerProfile.save();
    }
    
    // Add to followers list (store userId, not profile ID)
    if (!followingProfile.followers.some(id => id.toString() === followerId.toString())) {
      followingProfile.followers.push(followerId);
      await followingProfile.save();
    }
    
    // Return populated data
    const updatedFollowerProfile = await StudentProfile.findOne({ userId: followerId })
      .populate(populateFollowData)
      .populate(populateFollowingData);
    
    const updatedFollowingProfile = await StudentProfile.findOne({ userId: followingId })
      .populate(populateFollowData)
      .populate(populateFollowingData);
    
    return { followerProfile: updatedFollowerProfile, followingProfile: updatedFollowingProfile };
  } catch (error) {
    throw new Error(`Failed to follow user: ${error.message}`);
  }
};

export const unfollowUser = async (followerId, followingId) => {
  try {
    const followerProfile = await StudentProfile.findOne({ userId: followerId });
    const followingProfile = await StudentProfile.findOne({ userId: followingId });
    
    if (!followerProfile || !followingProfile) {
      throw new Error('One or both profiles not found');
    }
    
    // Remove from following list
    followerProfile.following = followerProfile.following.filter(
      id => id.toString() !== followingId.toString()
    );
    await followerProfile.save();
    
    // Remove from followers list
    followingProfile.followers = followingProfile.followers.filter(
      id => id.toString() !== followerId.toString()
    );
    await followingProfile.save();
    
    // Return populated data
    const updatedFollowerProfile = await StudentProfile.findOne({ userId: followerId })
      .populate(populateFollowData)
      .populate(populateFollowingData);
    
    const updatedFollowingProfile = await StudentProfile.findOne({ userId: followingId })
      .populate(populateFollowData)
      .populate(populateFollowingData);
    
    return { followerProfile: updatedFollowerProfile, followingProfile: updatedFollowingProfile };
  } catch (error) {
    throw new Error(`Failed to unfollow user: ${error.message}`);
  }
};

export const unlockBadge = async (userId, badge) => {
  try {
    const profile = await StudentProfile.findOne({ userId });
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // Check if badge already exists
    const badgeExists = profile.badges.some(b => b.name === badge.name);
    
    if (!badgeExists) {
      profile.badges.push({
        ...badge,
        unlockedAt: new Date()
      });
      await profile.save();
    }
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to unlock badge: ${error.message}`);
  }
};

export const addGoal = async (userId, goal) => {
  try {
    const profile = await StudentProfile.findOne({ userId });
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    profile.goals.push({
      ...goal,
      createdAt: new Date()
    });
    
    await profile.save();
    return profile;
  } catch (error) {
    throw new Error(`Failed to add goal: ${error.message}`);
  }
};

export const getLeaderboard = async (limit = 10, sortBy = 'totalXP') => {
  try {
    const leaderboard = await StudentProfile.find({ isPublic: true })
      .sort({ [sortBy]: -1 })
      .limit(limit)
      .select('name username avatar totalXP averageAccuracy topicsMastered currentStreak');
    
    return leaderboard;
  } catch (error) {
    throw new Error(`Failed to get leaderboard: ${error.message}`);
  }
};
