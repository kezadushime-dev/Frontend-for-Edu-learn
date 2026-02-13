// Mongoose model examples for EduLearn report workflow.
// Place in backend codebase (not frontend) if you use MongoDB.

import mongoose from 'mongoose';

const reportRequestSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    approvedBy: { type: String, default: null },
    approvedByName: { type: String, default: null },
    approvedByRole: { type: String, enum: ['ADMIN', 'INSTRUCTOR', null], default: null }
  },
  { timestamps: true }
);

const reportSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    analyticsSnapshot: { type: Object, required: true },
    overallAverage: { type: Number, required: true },
    performanceLevel: { type: String, required: true },
    approvedBy: { type: String, required: true },
    approvalDate: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const ReportRequest = mongoose.model('ReportRequest', reportRequestSchema);
export const Report = mongoose.model('Report', reportSchema);
