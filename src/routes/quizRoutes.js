import express from 'express';
import {
  addDailyQuestion,
  getTodayQuestions,
  checkAttempt,
  getQuizWindowStatusController,
  submitQuiz,
  getDailyLeaderboard,
  getQuizHistory,
  getSubmissionDetails,
  getTopPerformers,
  getQuizSettings,
  updateQuizSettings,
} from '../controllers/quizController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
// Check if user has already attempted today's quiz (accepts userId as query param)
router.get('/daily/check-attempt', checkAttempt);

// Protected routes (authentication required)
router.use(protect);

// Get dynamic quiz window status based on settings
router.get('/daily/window-status', getQuizWindowStatusController);

// Get today's quiz questions
router.get('/daily/questions', getTodayQuestions);

// Get quiz settings (accessible to all authenticated users)
router.get('/settings', getQuizSettings);

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

// Update quiz settings (admin only)
router.put('/settings', updateQuizSettings);

// Add question to daily quiz (admin only)
router.post('/daily/add-question', addDailyQuestion);

export default router;
