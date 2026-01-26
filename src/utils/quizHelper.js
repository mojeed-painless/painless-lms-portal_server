/**
 * Quiz Helper Functions
 * Handles time checking, ranking, and quiz window logic
 */

/**
 * Check if current time is within the quiz window (9:30 PM - 9:32 PM)
 * Quiz window is 2 minutes (120 seconds)
 * @returns {Object} { isQuizWindow: boolean, timeRemaining: number in seconds }
 */
export const getQuizWindowStatus = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 21:30:00 to 21:31:59 (9:30 PM to 9:31:59 PM)
  const quizStartHour = 14;
  const quizStartMinute = 35;
  const quizEndMinute = 37;

  const isQuizWindow =
    hours === quizStartHour &&
    ((minutes === quizStartMinute && seconds >= 0) || (minutes === quizStartMinute + 1));

  if (!isQuizWindow) {
    return {
      isQuizWindow: false,
      timeRemaining: 0,
      message: 'Quiz window is not active. Available: 9:30 PM - 9:32 PM',
    };
  }

  // Calculate remaining seconds
  let timeRemaining;
  if (minutes === quizStartMinute) {
    timeRemaining = 60 - seconds; // Remaining in first minute
  } else {
    timeRemaining = 120 - (60 + seconds); // Remaining in second minute
  }

  return {
    isQuizWindow: true,
    timeRemaining,
    message: `Quiz is live! ${timeRemaining} seconds remaining`,
  };
};

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 * Ensures consistency across all timezones
 * @returns {string}
 */
export const getTodayDate = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if quiz window has passed for today
 * @returns {boolean}
 */
export const isQuizWindowClosed = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Quiz ends at 8:02 PM (20:02)
  return hours > 20 || (hours === 20 && minutes >= 2);
};

/**
 * Calculate bonus points based on rank
 * @param {number} rank - Rank position (1, 2, 3, etc.)
 * @returns {number} - Bonus points
 */
export const calculateBonusPoints = (rank) => {
  if (rank === 1) return 5;
  if (rank === 2) return 3;
  if (rank === 3) return 1;
  return 0;
};

/**
 * Get badge emoji based on rank
 * @param {number} rank - Rank position
 * @returns {string} - Badge emoji with text
 */
export const getBadge = (rank) => {
  const badges = {
    1: '🥇 1st Place',
    2: '🥈 2nd Place',
    3: '🥉 3rd Place',
  };
  return badges[rank] || null;
};

/**
 * Calculate ranking from submissions
 * Sorting criteria:
 * 1. Correct answers (DESC) - more correct first
 * 2. Time taken (ASC) - faster first
 * @param {Array} submissions - Array of submission documents
 * @returns {Array} - Ranked submissions
 */
export const calculateRankings = (submissions) => {
  // Sort by correctAnswers DESC, then by timeTaken ASC
  const sorted = submissions.sort((a, b) => {
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    return a.timeTaken - b.timeTaken;
  });

  // Assign ranks and bonuses
  return sorted.map((submission, index) => {
    const rank = index + 1;
    const bonusPoints = calculateBonusPoints(rank);
    const badge = getBadge(rank);

    return {
      ...submission,
      rank,
      bonusPoints,
      badge,
      totalPoints: submission.correctAnswers + bonusPoints,
    };
  });
};

/**
 * Validate submission time is within quiz window
 * @param {Date} submittedAt - Submission timestamp
 * @returns {boolean}
 */
export const isSubmissionWithinWindow = (submittedAt) => {
  const submitted = new Date(submittedAt);
  const hours = submitted.getHours();
  const minutes = submitted.getMinutes();

  // Must be submitted between 8:00 PM and 8:02 PM
  return (
    hours === 20 &&
    minutes >= 0 &&
    minutes < 2
  );
};

/**
 * Validate time taken is reasonable
 * @param {number} timeTaken - Time in seconds
 * @returns {boolean}
 */
export const isValidTimeTaken = (timeTaken) => {
  // Minimum 5 seconds, maximum 120 seconds (2 minutes)
  return timeTaken >= 5 && timeTaken <= 120;
};

/**
 * Calculate percentage from correct answers
 * @param {number} correctAnswers
 * @param {number} totalQuestions
 * @returns {number}
 */
export const calculatePercentage = (correctAnswers, totalQuestions) => {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};
