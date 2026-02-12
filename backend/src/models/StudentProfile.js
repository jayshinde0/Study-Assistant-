import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    // Basic Info
    name: String,
    email: String,
    username: String,
    avatar: String,
    bio: String,
    
    // Academic Info
    school: String,
    grade: String,
    major: String,
    learningStyle: {
      type: String,
      enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading', 'Mixed'],
      default: 'Mixed'
    },
    
    // Study Statistics
    totalStudyHours: {
      type: Number,
      default: 0
    },
    totalQuizzesTaken: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalXP: {
      type: Number,
      default: 0
    },
    
    // Performance Metrics
    topicsStudied: {
      type: Number,
      default: 0
    },
    topicsMastered: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    },
    
    // Achievements
    badges: [
      {
        name: String,
        description: String,
        icon: String,
        unlockedAt: Date
      }
    ],
    
    // Learning Goals
    goals: [
      {
        title: String,
        description: String,
        targetAccuracy: Number,
        targetTopics: Number,
        deadline: Date,
        progress: Number,
        status: {
          type: String,
          enum: ['active', 'completed', 'abandoned'],
          default: 'active'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    // Preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      showOnLeaderboard: {
        type: Boolean,
        default: true
      }
    },
    
    // Social
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    
    // Activity
    lastActiveAt: Date,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    
    // Metadata
    isPublic: {
      type: Boolean,
      default: true
    },
    bio: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  { timestamps: true }
);

// Index for faster queries
studentProfileSchema.index({ username: 1 });
studentProfileSchema.index({ email: 1 });
studentProfileSchema.index({ totalXP: -1 });
studentProfileSchema.index({ averageAccuracy: -1 });

export default mongoose.model('StudentProfile', studentProfileSchema);
