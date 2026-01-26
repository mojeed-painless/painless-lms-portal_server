import express from 'express';
import {
  addDailyQuestion,
  getTodayQuestions,
  checkAttempt,
  submitQuiz,
  getDailyLeaderboard,
  getQuizHistory,
  getSubmissionDetails,
  getTopPerformers,
} from '../controllers/quizController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
// (You can add public routes here if needed)

// Protected routes (authentication required)
router.use(protect);

// Check if user has already attempted today's quiz
router.get('/daily/check-attempt', checkAttempt);

// Get today's quiz questions
router.get('/daily/questions', getTodayQuestions);

// Submit quiz answers
router.post('/daily/submit', submitQuiz);

// Get today's leaderboard
router.get('/daily/leaderboard', getDailyLeaderboard);

// Get quiz history for current student
router.get('/history', getQuizHistory);

// Get specific submission details
router.get('/submission/:submissionId', getSubmissionDetails);

// Get top performers
router.get('/top-performers', getTopPerformers);

// Admin routes (admin only)
router.use(admin);

// Add question to daily quiz (admin only)
router.post('/daily/add-question', addDailyQuestion);

export default router;
