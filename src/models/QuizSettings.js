import mongoose from 'mongoose';

const quizSettingsSchema = mongoose.Schema(
  {
    releaseTime: {
      type: String,
      required: true,
      default: '15:32',
      // Format: HH:MM (24-hour format)
    },
    duration: {
      type: Number,
      required: true,
      default: 2,
      // Duration in minutes
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

export default mongoose.model('QuizSettings', quizSettingsSchema);
