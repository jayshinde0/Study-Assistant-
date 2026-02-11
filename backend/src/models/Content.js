import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  originalText: { type: String, required: true },
  fileType: { type: String, enum: ['text', 'pdf', 'docx', 'youtube'], default: 'text' },
  type: { type: String, enum: ['text', 'pdf', 'youtube'], default: 'text' },
  pdfUrl: String,
  youtubeUrl: String,
  summaries: {
    brief: String,
    detailed: String,
    comprehensive: String
  },
  topics: [String],
  bookmarked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Content', contentSchema);
