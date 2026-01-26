import mongoose from 'mongoose';

const dailyQuizSchema = mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      // Format: YYYY-MM-DD
    },
    questions: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        question: {
          type: String,
          required: true,
        },
        image: {
          type: String, // URL to stored image
          default: null,
        },
        options: {
          A: String,
          B: String,
          C: String,
          D: String,
        },
        correctAnswer: {
          type: String,
          enum: ['A', 'B', 'C', 'D'],
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false, // Set to true at 8:00 PM
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
dailyQuizSchema.index({ date: 1 });

export default mongoose.model('DailyQuiz', dailyQuizSchema);
