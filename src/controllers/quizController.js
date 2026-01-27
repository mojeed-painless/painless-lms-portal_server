import asyncHandler from 'express-async-handler';
import DailyQuiz from '../models/DailyQuiz.js';
import QuizSubmission from '../models/QuizSubmission.js';
import QuizSettings from '../models/QuizSettings.js';
import {
  getQuizWindowStatus,
  getTodayDate,
  isQuizWindowClosed,
  calculateRankings,
  isSubmissionWithinWindow,
  isValidTimeTaken,
  calculatePercentage,
  calculateBonusPoints,
  getBadge,
} from '../utils/quizHelper.js';
import mongoose from 'mongoose';

/**
 * @desc    Add a question to today's daily quiz (Admin only)
 * @route   POST /api/quizzes/daily/add-question
 * @access  Private/Admin
 */
export const addDailyQuestion = asyncHandler(async (req, res) => {
  const { question, image, options, correctAnswer, date } = req.body;

  console.log('📝 [ADD QUESTION] Received request:', { question: question?.substring(0, 50), date, options: !!options, correctAnswer });

  // Validate required fields
  if (!question || !options || !correctAnswer || !date) {
    res.status(400);
    throw new Error('All fields are required: question, options (A, B, C, D), correctAnswer, date');
  }

  // Validate options object has all required keys
  if (!options.A || !options.B || !options.C || !options.D) {
    res.status(400);
    throw new Error('Options must include all keys: A, B, C, D');
  }

  // Validate correctAnswer is valid
  if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    res.status(400);
    throw new Error('Correct answer must be A, B, C, or D');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    res.status(400);
    throw new Error('Date must be in format YYYY-MM-DD');
  }

  // Find or create quiz for the specified date
  let dailyQuiz = await DailyQuiz.findOne({ date });

  if (!dailyQuiz) {
    console.log(`📝 Creating new DailyQuiz for date: ${date}`);
    dailyQuiz = new DailyQuiz({ date });
  }

  // Add new question
  const newQuestion = {
    _id: new mongoose.Types.ObjectId(),
    question,
    image: image || null,
    options: {
      A: options.A,
      B: options.B,
      C: options.C,
      D: options.D,
    },
    correctAnswer,
    addedAt: new Date(),
  };

  dailyQuiz.questions.push(newQuestion);
  dailyQuiz.isActive = true;
  await dailyQuiz.save();

  console.log(`✅ [ADD QUESTION] Question saved successfully for date ${date}`);

  res.status(201).json({
    id: newQuestion._id,
    date,
    question,
    image: newQuestion.image,
    options: newQuestion.options,
    correctAnswer,
  });
});

/**
 * @desc    Get quiz questions for a specific date
 * @route   GET /api/quizzes/daily/questions?date=YYYY-MM-DD
 * @access  Private
 */
export const getTodayQuestions = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const queryDate = date || getTodayDate();

  console.log(`🔍 [GET QUESTIONS] Fetching questions for date: ${queryDate}`);
  console.log(`🔍 [GET QUESTIONS] All DailyQuiz documents in DB:`, await DailyQuiz.find({}).select('date questions'));

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(queryDate)) {
    res.status(400);
    throw new Error('Date must be in format YYYY-MM-DD');
  }

  const dailyQuiz = await DailyQuiz.findOne({ date: queryDate });

  console.log(`🔍 [GET QUESTIONS] Query result for ${queryDate}:`, dailyQuiz ? `Found ${dailyQuiz.questions.length} questions` : 'No document found');

  // Return empty array if no questions exist
  if (!dailyQuiz || dailyQuiz.questions.length === 0) {
    console.log(`📭 No questions found for ${queryDate}`);
    return res.json([]);
  }

  // Format questions for response
  const formattedQuestions = dailyQuiz.questions.map((q) => ({
    id: q._id,
    date: queryDate,
    question: q.question,
    image: q.image,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));

  console.log(`✅ [GET QUESTIONS] Found ${formattedQuestions.length} questions for ${queryDate}`);
  res.json(formattedQuestions);
});

/**
 * @desc    Check if user has already attempted today's quiz
 * @route   GET /api/quizzes/daily/check-attempt
 * @access  Private
 */
export const checkAttempt = asyncHandler(async (req, res) => {
  const { date, userId: queryUserId } = req.query;
  const queryDate = date || getTodayDate();
  
  // Get userId from authenticated user or query parameter (fallback for frontend)
  const userId = req.user?._id || queryUserId;

  if (!userId) {
    res.status(400);
    throw new Error('User ID not found. Please ensure you are authenticated or pass userId in query params.');
  }

  console.log(`🔍 [CHECK ATTEMPT] Checking quiz attempt for user ${userId} on date ${queryDate}`);

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(queryDate)) {
    res.status(400);
    throw new Error('Date must be in format YYYY-MM-DD');
  }

  // Check if user has already attempted the quiz
  const submission = await QuizSubmission.findOne({
    studentId: userId,
    date: queryDate,
  });

  if (submission) {
    console.log(`✅ [CHECK ATTEMPT] User has already attempted quiz on ${queryDate}`);
    return res.json({
      hasAttempted: true,
      submissionId: submission._id,
      score: {
        correctAnswers: submission.correctAnswers,
        totalQuestions: submission.totalQuestions,
        percentage: submission.percentage,
      },
      rank: submission.rank,
      badge: submission.badge,
      bonusPoints: submission.bonusPoints,
      totalPoints: submission.totalPoints,
      submittedAt: submission.submittedAt,
    });
  }

  console.log(`✅ [CHECK ATTEMPT] User has not attempted quiz on ${queryDate}`);
  return res.json({
    hasAttempted: false,
  });
});

/**
 * @desc    Get current quiz window status based on settings
 * @route   GET /api/quizzes/daily/window-status
 * @access  Private
 */
export const getQuizWindowStatusController = asyncHandler(async (req, res) => {
  console.log('🔍 [WINDOW STATUS] Fetching dynamic quiz window status');

  // Fetch current settings
  let settings = await QuizSettings.findOne();

  // If no settings exist, create defaults
  if (!settings) {
    console.log('📝 [WINDOW STATUS] No settings found, creating defaults');
    settings = new QuizSettings({
      releaseTime: '15:32',
      duration: 2,
    });
    await settings.save();
  }

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Parse release time (HH:MM format)
  const [releaseHour, releaseMinute] = settings.releaseTime.split(':').map(Number);
  const endMinute = (releaseMinute + settings.duration) % 60;
  const endHour = releaseMinute + settings.duration >= 60 ? (releaseHour + 1) % 24 : releaseHour;

  // Check if current time is within the quiz window
  const isQuizWindow =
    (hours === releaseHour && minutes >= releaseMinute) ||
    (hours === endHour && minutes < endMinute) ||
    (hours === releaseHour && minutes === releaseMinute && seconds < 60);

  let beforeQuizSeconds = 0; // Seconds until quiz starts
  let duringQuizSeconds = 0; // Seconds remaining in quiz window
  let windowStartTime = '';
  let windowEndTime = '';

  // Parse current time in seconds
  const nowTotalSeconds = hours * 3600 + minutes * 60 + seconds;
  const startTotalSeconds = releaseHour * 3600 + releaseMinute * 60;
  const endTotalSeconds = endHour * 3600 + endMinute * 60;

  // Calculate time to start (for before__quiz countdown)
  beforeQuizSeconds = startTotalSeconds - nowTotalSeconds;
  if (beforeQuizSeconds < 0) {
    beforeQuizSeconds += 86400; // 24 hours in seconds
  }

  // Calculate remaining time (for during__quiz countdown)
  if (isQuizWindow) {
    duringQuizSeconds = endTotalSeconds - nowTotalSeconds;
    if (duringQuizSeconds < 0) {
      duringQuizSeconds = 0;
    }
  }

  // Format times for display (HH:MM format)
  windowStartTime = `${String(releaseHour).padStart(2, '0')}:${String(releaseMinute).padStart(2, '0')}`;
  windowEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

  console.log('✅ [WINDOW STATUS] Calculated:', {
    isQuizWindow,
    windowStart: windowStartTime,
    windowEnd: windowEndTime,
    duration: settings.duration,
    beforeQuizSeconds,
    duringQuizSeconds,
  });

  res.json({
    isQuizWindow,
    windowStart: windowStartTime,
    windowEnd: windowEndTime,
    duration: settings.duration,
    // Before Quiz Countdown - 24hr countdown (visible before quiz starts)
    before__quiz: {
      isVisible: !isQuizWindow, // Show ONLY when quiz is NOT active
      secondsUntilStart: beforeQuizSeconds,
      message: `Quiz starts in ${beforeQuizSeconds} seconds`,
    },
    // During Quiz Countdown - quiz duration countdown (visible during quiz)
    during__quiz: {
      isVisible: isQuizWindow, // Show ONLY when quiz IS active
      secondsRemaining: duringQuizSeconds,
      message: `Quiz ends in ${duringQuizSeconds} seconds`,
    },
  });
});

/**
 * @desc    Submit quiz answers
 * @route   POST /api/quizzes/daily/submit
 * @access  Private
 */
export const submitQuiz = asyncHandler(async (req, res) => {
  const { studentId, studentName, date, responses, timeTaken, submittedAt } = req.body;

  // Validate required fields
  if (!studentId || !studentName || !date || !responses || timeTaken === undefined || !submittedAt) {
    res.status(400);
    throw new Error('Missing required fields: studentId, studentName, date, responses, timeTaken, submittedAt');
  }

  // Fetch current settings for time window validation
  let settings = await QuizSettings.findOne();
  if (!settings) {
    settings = new QuizSettings({
      releaseTime: '15:32',
      duration: 2,
    });
    await settings.save();
  }

  // Validate submission is within quiz window
  const submissionDate = new Date(submittedAt);
  const hours = submissionDate.getHours();
  const minutes = submissionDate.getMinutes();
  const seconds = submissionDate.getSeconds();

  const [releaseHour, releaseMinute] = settings.releaseTime.split(':').map(Number);
  const endMinute = (releaseMinute + settings.duration) % 60;
  const endHour = releaseMinute + settings.duration >= 60 ? (releaseHour + 1) % 24 : releaseHour;

  // Calculate total seconds for precise time comparison
  const submissionTotalSeconds = hours * 3600 + minutes * 60 + seconds;
  const windowStartSeconds = releaseHour * 3600 + releaseMinute * 60;
  const windowEndSeconds = windowStartSeconds + (settings.duration * 60);

  // Check if submission time is within the quiz window
  const isWithinWindow = submissionTotalSeconds >= windowStartSeconds && submissionTotalSeconds < windowEndSeconds;

  if (!isWithinWindow) {
    const windowEndFormatted = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    console.log(`❌ [SUBMIT QUIZ] Submission outside window. Submission: ${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}, Window: ${settings.releaseTime} - ${windowEndFormatted}`);
    res.status(400);
    throw new Error(`Quiz window has closed. Available: ${settings.releaseTime} - ${windowEndFormatted}`);
  }

  // Validate timeTaken
  if (!isValidTimeTaken(timeTaken)) {
    res.status(400);
    throw new Error('Time taken must be between 5 and 120 seconds');
  }

  // Check for duplicate submission
  const existingSubmission = await QuizSubmission.findOne({
    studentId,
    date,
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate submission detected. Student has already submitted for this quiz.',
      existingSubmissionId: existingSubmission._id,
    });
  }

  // Get today's quiz
  const dailyQuiz = await DailyQuiz.findOne({ date });

  if (!dailyQuiz || dailyQuiz.questions.length === 0) {
    res.status(404);
    throw new Error('Quiz not found for this date');
  }

  // Calculate correct answers
  let correctAnswers = 0;
  const detailedResponses = [];

  Object.entries(responses).forEach(([questionId, studentAnswer]) => {
    const question = dailyQuiz.questions.find((q) => q._id.toString() === questionId);

    if (question) {
      const isCorrect = question.correctAnswer === studentAnswer;
      if (isCorrect) {
        correctAnswers++;
      }

      detailedResponses.push({
        questionId: question._id,
        studentAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      });
    }
  });

  const percentage = calculatePercentage(correctAnswers, dailyQuiz.questions.length);

  // Create submission
  const submission = new QuizSubmission({
    studentId,
    studentName,
    date,
    responses,
    timeTaken,
    submittedAt: submissionDate,
    correctAnswers,
    totalQuestions: dailyQuiz.questions.length,
    percentage,
  });

  await submission.save();

  console.log(`✅ [SUBMIT QUIZ] Quiz submitted successfully for user ${studentId}`);

  res.status(201).json({
    success: true,
    message: 'Quiz submitted successfully',
    submissionId: submission._id,
    score: {
      correctAnswers,
      totalQuestions: dailyQuiz.questions.length,
      percentage,
    },
    provisionalRank: null, // Will be calculated after window closes
    detailedResponses,
  });
});

/**
 * @desc    Get today's leaderboard (top 3 after quiz window closes)
 * @route   GET /api/quizzes/daily/leaderboard
 * @access  Private
 */
export const getDailyLeaderboard = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const queryDate = date || getTodayDate();

  // Fetch current settings to check if quiz window is still open
  let settings = await QuizSettings.findOne();
  if (!settings) {
    settings = new QuizSettings({
      releaseTime: '15:32',
      duration: 2,
    });
    await settings.save();
  }

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const [releaseHour, releaseMinute] = settings.releaseTime.split(':').map(Number);
  const endMinute = (releaseMinute + settings.duration) % 60;
  const endHour = releaseMinute + settings.duration >= 60 ? (releaseHour + 1) % 24 : releaseHour;

  // Calculate total seconds for precise time comparison
  const nowTotalSeconds = hours * 3600 + minutes * 60 + seconds;
  const windowStartSeconds = releaseHour * 3600 + releaseMinute * 60;
  const windowEndSeconds = windowStartSeconds + (settings.duration * 60);

  // Check if current time is within the quiz window
  const isQuizWindow = nowTotalSeconds >= windowStartSeconds && nowTotalSeconds < windowEndSeconds;

  const submissions = await QuizSubmission.find({ date: queryDate });

  // If quiz is still running, return empty leaderboard
  if (isQuizWindow) {
    const windowEndFormatted = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    console.log(`⏳ [GET LEADERBOARD] Quiz is still running for ${queryDate} (until ${windowEndFormatted}) - returning empty leaderboard. Current time: ${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    return res.json([]);
  }

  // If quiz window is closed, calculate rankings if not already done
  if (submissions.length === 0) {
    console.log(`📭 [GET LEADERBOARD] No submissions found for ${queryDate}`);
    return res.json([]);
  }

  // Update submissions with rankings and bonuses
  const rankedSubmissions = calculateRankings(submissions);

  // Bulk update submissions with ranking data
  const updatePromises = rankedSubmissions.map((submission) =>
    QuizSubmission.findByIdAndUpdate(
      submission._id,
      {
        rank: submission.rank,
        bonusPoints: submission.bonusPoints,
        totalPoints: submission.totalPoints,
        badge: submission.badge,
        rankingCalculated: true,
      },
      { new: true }
    )
  );

  await Promise.all(updatePromises);

  // Get top 3 for leaderboard
  const top3 = rankedSubmissions.slice(0, 3).map((sub) => ({
    studentId: sub.studentId,
    studentName: sub.studentName,
    correctAnswers: sub.correctAnswers,
    totalQuestions: sub.totalQuestions,
    timeTaken: sub.timeTaken,
    totalPoints: sub.totalPoints,
  }));

  console.log(`✅ [GET LEADERBOARD] Returning top 3 for date ${queryDate}`);
  res.json(top3);
});

/**
 * @desc    Get student's quiz history
 * @route   GET /api/quizzes/history
 * @access  Private
 */
export const getQuizHistory = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { limit = 10, offset = 0 } = req.query;

  const submissions = await QuizSubmission.find({ studentId })
    .sort({ date: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit));

  if (submissions.length === 0) {
    return res.json({
      success: true,
      studentId,
      totalQuizzes: 0,
      quizzes: [],
    });
  }

  // Enhance with detailed question info
  const quizzesWithDetails = await Promise.all(
    submissions.map(async (submission) => {
      const dailyQuiz = await DailyQuiz.findOne({ date: submission.date });

      if (!dailyQuiz) {
        return {
          id: submission._id,
          date: submission.date,
          questions: [],
          score: {
            correctAnswers: submission.correctAnswers,
            totalQuestions: submission.totalQuestions,
            percentage: submission.percentage,
          },
          timeTaken: submission.timeTaken,
          rank: submission.rank,
          points: submission.totalPoints,
          bonusPoints: submission.bonusPoints,
          submittedAt: submission.submittedAt,
        };
      }

      const detailedQuestions = dailyQuiz.questions.map((question) => ({
        questionId: question._id,
        question: question.question,
        image: question.image,
        options: question.options,
        studentAnswer: submission.responses.get(question._id.toString()),
        correctAnswer: question.correctAnswer,
        isCorrect:
          submission.responses.get(question._id.toString()) === question.correctAnswer,
      }));

      return {
        id: submission._id,
        date: submission.date,
        questions: detailedQuestions,
        score: {
          correctAnswers: submission.correctAnswers,
          totalQuestions: submission.totalQuestions,
          percentage: submission.percentage,
        },
        timeTaken: submission.timeTaken,
        rank: submission.rank,
        points: submission.totalPoints,
        bonusPoints: submission.bonusPoints,
        submittedAt: submission.submittedAt,
      };
    })
  );

  const totalQuizzes = await QuizSubmission.countDocuments({ studentId });

  res.json({
    success: true,
    studentId,
    totalQuizzes,
    quizzes: quizzesWithDetails,
  });
});

/**
 * @desc    Get a specific submission details
 * @route   GET /api/quizzes/submission/:submissionId
 * @access  Private
 */
export const getSubmissionDetails = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  const submission = await QuizSubmission.findById(submissionId);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Check authorization (student can only view their own submission)
  if (submission.studentId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this submission');
  }

  const dailyQuiz = await DailyQuiz.findOne({ date: submission.date });

  const detailedQuestions = dailyQuiz.questions.map((question) => ({
    questionId: question._id,
    question: question.question,
    image: question.image,
    options: question.options,
    studentAnswer: submission.responses.get(question._id.toString()),
    correctAnswer: question.correctAnswer,
    isCorrect:
      submission.responses.get(question._id.toString()) === question.correctAnswer,
  }));

  res.json({
    success: true,
    submission: {
      id: submission._id,
      date: submission.date,
      questions: detailedQuestions,
      score: {
        correctAnswers: submission.correctAnswers,
        totalQuestions: submission.totalQuestions,
        percentage: submission.percentage,
      },
      timeTaken: submission.timeTaken,
      rank: submission.rank,
      points: submission.totalPoints,
      bonusPoints: submission.bonusPoints,
      badge: submission.badge,
      submittedAt: submission.submittedAt,
    },
  });
});

/**
 * @desc    Get top performers across all quizzes
 * @route   GET /api/quizzes/top-performers
 * @access  Private
 */
export const getTopPerformers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topPerformers = await QuizSubmission.aggregate([
    {
      $group: {
        _id: '$studentId',
        studentName: { $first: '$studentName' },
        totalScore: { $sum: '$totalPoints' },
        quizzesAttempted: { $sum: 1 },
        averageCorrect: { $avg: '$correctAnswers' },
        totalRank1: {
          $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] },
        },
        totalRank2: {
          $sum: { $cond: [{ $eq: ['$rank', 2] }, 1, 0] },
        },
        totalRank3: {
          $sum: { $cond: [{ $eq: ['$rank', 3] }, 1, 0] },
        },
      },
    },
    {
      $sort: { totalScore: -1 },
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  res.json({
    success: true,
    topPerformers: topPerformers.map((performer, index) => ({
      rank: index + 1,
      studentId: performer._id,
      studentName: performer.studentName,
      totalPoints: performer.totalScore,
      quizzesAttempted: performer.quizzesAttempted,
      averageCorrect: performer.averageCorrect.toFixed(2),
      achievements: {
        firstPlace: performer.totalRank1,
        secondPlace: performer.totalRank2,
        thirdPlace: performer.totalRank3,
      },
    })),
  });
});

/**
 * @desc    Get quiz settings (release time and duration)
 * @route   GET /api/quizzes/settings
 * @access  Private
 */
export const getQuizSettings = asyncHandler(async (req, res) => {
  console.log('🔍 [GET SETTINGS] Fetching quiz settings');

  let settings = await QuizSettings.findOne();

  // If no settings exist, create default ones
  if (!settings) {
    console.log('📝 [GET SETTINGS] No settings found, creating defaults');
    settings = new QuizSettings({
      releaseTime: '15:32',
      duration: 2,
    });
    await settings.save();
  }

  console.log('✅ [GET SETTINGS] Settings retrieved:', {
    releaseTime: settings.releaseTime,
    duration: settings.duration,
  });

  res.json({
    releaseTime: settings.releaseTime,
    duration: settings.duration,
  });
});

/**
 * @desc    Update quiz settings (release time and duration)
 * @route   PUT /api/quizzes/settings
 * @access  Private/Admin
 */
export const updateQuizSettings = asyncHandler(async (req, res) => {
  const { releaseTime, duration } = req.body;

  console.log('📝 [UPDATE SETTINGS] Received request:', { releaseTime, duration });

  // Validate required fields
  if (!releaseTime || duration === undefined) {
    res.status(400);
    throw new Error('Missing required fields: releaseTime, duration');
  }

  // Validate releaseTime format (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(releaseTime)) {
    res.status(400);
    throw new Error('Release time must be in HH:MM format (24-hour)');
  }

  // Validate duration
  if (typeof duration !== 'number' || duration <= 0 || duration > 60) {
    res.status(400);
    throw new Error('Duration must be a positive number between 1 and 60 minutes');
  }

  // Find existing settings or create new ones
  let settings = await QuizSettings.findOne();

  if (!settings) {
    console.log('📝 [UPDATE SETTINGS] Creating new settings document');
    settings = new QuizSettings({
      releaseTime,
      duration,
    });
  } else {
    settings.releaseTime = releaseTime;
    settings.duration = duration;
  }

  await settings.save();

  console.log('✅ [UPDATE SETTINGS] Settings updated successfully:', {
    releaseTime: settings.releaseTime,
    duration: settings.duration,
  });

  res.json({
    releaseTime: settings.releaseTime,
    duration: settings.duration,
    message: 'Settings updated successfully',
  });
});
