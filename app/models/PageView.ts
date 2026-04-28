// app/models/PageView.ts
import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    default: '/',
  },
  userId: {
    type: String,
    default: null,
  },
  userName: {
    type: String,
    default: 'Guest',
  },
  userRole: {
    type: String,
    default: 'guest',
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  referrer: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sessionId: {
    type: String,
    required: true,
  },
});

// Create index for faster queries
PageViewSchema.index({ timestamp: -1 });
PageViewSchema.index({ userId: 1 });
PageViewSchema.index({ sessionId: 1 });

export default mongoose.models.PageView || mongoose.model('PageView', PageViewSchema);