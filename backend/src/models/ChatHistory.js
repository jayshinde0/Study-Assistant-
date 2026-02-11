import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        sources: [
          {
            contentId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Content'
            },
            title: {
              type: String,
              default: ''
            },
            type: {
              type: String,
              default: ''
            },
            relevanceScore: {
              type: Number,
              default: 0
            }
          }
        ],
        suggestedQuestions: [String],
        topics: [String]
      }
    ],
    sessionTitle: {
      type: String,
      default: 'Chat Session'
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    topicsDiscussed: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient queries
chatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);
