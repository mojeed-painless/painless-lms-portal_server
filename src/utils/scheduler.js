import cron from 'node-cron';
import QuizSubmission from '../models/QuizSubmission.js';
import {
  getTodayDate,
  calculateRankings,
} from '../utils/quizHelper.js';

/**
 * Schedule ranking calculation to run at 8:03 PM daily
 * This runs after the quiz window closes (8:02 PM)
 */
export const scheduleDailyRankingCalculation = () => {
  // Run every day at 20:03:00 (8:03 PM)
  cron.schedule('3 20 * * *', async () => {
    try {
      console.log('[CRON] Running daily ranking calculation at 8:03 PM');
      await calculateDailyRankings();
    } catch (error) {
      console.error('[CRON ERROR] Failed to calculate daily rankings:', error);
    }
  });

  console.log('[SCHEDULER] Daily ranking calculation scheduled for 8:03 PM');
};

/**
 * Calculate and save rankings for today's quiz submissions
 * This is called automatically via cron job at 8:03 PM
 */
export const calculateDailyRankings = async () => {
  const today = getTodayDate();

  try {
    // Get all submissions for today that haven't been ranked yet
    const submissions = await QuizSubmission.find({
      date: today,
      rankingCalculated: false,
    });

    if (submissions.length === 0) {
      console.log(`[RANKING] No new submissions to rank for ${today}`);
      return;
    }

    // Calculate rankings
    const rankedSubmissions = calculateRankings(submissions);

    // Bulk update submissions with ranking data
    const updatePromises = rankedSubmissions.map((submission) =>
      QuizSubmission.updateOne(
        { _id: submission._id },
        {
          rank: submission.rank,
          bonusPoints: submission.bonusPoints,
          totalPoints: submission.totalPoints,
          badge: submission.badge,
          rankingCalculated: true,
        }
      )
    );

    await Promise.all(updatePromises);

    console.log(
      `[RANKING] Successfully ranked ${rankedSubmissions.length} submissions for ${today}`
    );

    // Log top 3 for verification
    const top3 = rankedSubmissions.slice(0, 3);
    if (top3.length > 0) {
      console.log('[RANKING] Top 3 performers:');
      top3.forEach((sub) => {
        console.log(
          `  Rank ${sub.rank}: ${sub.studentName} - ${sub.correctAnswers}/${sub.totalQuestions} correct (${sub.timeTaken}s)`
        );
      });
    }
  } catch (error) {
    console.error('[RANKING ERROR] Failed to calculate rankings:', error);
    throw error;
  }
};

/**
 * Manual trigger for ranking calculation (useful for testing)
 * Can be called via an admin API endpoint
 */
export const manualTriggerRankingCalculation = async () => {
  try {
    await calculateDailyRankings();
    return {
      success: true,
      message: 'Ranking calculation triggered successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
