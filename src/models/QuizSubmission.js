import mongoose from 'mongoose';

const quizSubmissionSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      // Format: YYYY-MM-DD
    },
    responses: {
      type: Map,
      of: String,
      // Map of questionId -> studentAnswer (A, B, C, or D)
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true,
      // Time in seconds to complete the quiz
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: null,
      // Assigned after quiz window closes
    },
    bonusPoints: {
      type: Number,
      default: 0,
      // 5 for rank 1, 3 for rank 2, 1 for rank 3, 0 for others
    },
    totalPoints: {
      type: Number,
      default: 0,
      // bonusPoints + correctAnswers
    },
    badge: {
      type: String,
      default: null,
      // "🥇 1st Place", "🥈 2nd Place", etc.
    },
    rankingCalculated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
quizSubmissionSchema.index({ studentId: 1, date: 1 }, { unique: true });
quizSubmissionSchema.index({ date: 1 });
quizSubmissionSchema.index({ date: 1, rank: 1 });

export default mongoose.model('QuizSubmission', quizSubmissionSchema);
