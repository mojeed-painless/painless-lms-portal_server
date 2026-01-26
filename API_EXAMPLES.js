/**
 * DAILY QUIZ API - QUICK REFERENCE & CURL EXAMPLES
 * 
 * Use these examples to test the Daily Quiz API endpoints
 */

// ============================================================
// 1. ADMIN: Add Question to Daily Quiz
// ============================================================

/**
 * Endpoint: POST /api/quizzes/daily/add-question
 * Access: Admin only, only during 8:00-8:02 PM
 */

// cURL Example
/*
curl -X POST http://localhost:5000/api/quizzes/daily/add-question \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "question": "What is React?",
    "optionA": "A library for building UIs",
    "optionB": "A programming language",
    "optionC": "A database",
    "optionD": "A server framework",
    "correctAnswer": "A"
  }'
*/

// JavaScript Fetch Example
async function addQuestion(adminToken) {
  const response = await fetch('http://localhost:5000/api/quizzes/daily/add-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      question: 'What is React?',
      optionA: 'A library for building UIs',
      optionB: 'A programming language',
      optionC: 'A database',
      optionD: 'A server framework',
      correctAnswer: 'A'
    })
  });
  return response.json();
}

// ============================================================
// 2. GET: Today's Quiz Questions
// ============================================================

/**
 * Endpoint: GET /api/quizzes/daily/questions
 * Access: Authenticated users
 */

// cURL Example
/*
curl -X GET http://localhost:5000/api/quizzes/daily/questions \
  -H "Authorization: Bearer YOUR_TOKEN"
*/

// JavaScript Fetch Example
async function getQuestions(authToken) {
  const response = await fetch('http://localhost:5000/api/quizzes/daily/questions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const data = await response.json();
  
  console.log(`Quiz Live: ${data.quizLive}`);
  console.log(`Time Remaining: ${data.timeRemaining} seconds`);
  console.log(`Total Questions: ${data.totalQuestions}`);
  console.log('Questions:', data.questions);
  
  return data;
}

// ============================================================
// 3. POST: Submit Quiz Answers
// ============================================================

/**
 * Endpoint: POST /api/quizzes/daily/submit
 * Access: Authenticated users (only 8:00-8:02 PM)
 */

// cURL Example
/*
curl -X POST http://localhost:5000/api/quizzes/daily/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "student_id_123",
    "studentName": "John Doe",
    "date": "2026-01-25",
    "responses": {
      "question_id_1": "A",
      "question_id_2": "B",
      "question_id_3": "C"
    },
    "timeTaken": 45,
    "submittedAt": "2026-01-25T20:01:30.000Z"
  }'
*/

// JavaScript Fetch Example
async function submitQuiz(authToken, studentId, studentName, responses, timeTaken) {
  const response = await fetch('http://localhost:5000/api/quizzes/daily/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      studentId,
      studentName,
      date: new Date().toISOString().split('T')[0],
      responses,
      timeTaken,
      submittedAt: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`Score: ${data.score.correctAnswers}/${data.score.totalQuestions}`);
    console.log(`Percentage: ${data.score.percentage}%`);
  } else {
    console.error('Error:', data.error);
  }
  
  return data;
}

// ============================================================
// 4. GET: Today's Leaderboard
// ============================================================

/**
 * Endpoint: GET /api/quizzes/daily/leaderboard
 * Access: Authenticated users
 * Note: Empty during quiz, populated after 8:02 PM
 */

// cURL Example
/*
curl -X GET "http://localhost:5000/api/quizzes/daily/leaderboard?date=2026-01-25" \
  -H "Authorization: Bearer YOUR_TOKEN"
*/

// JavaScript Fetch Example
async function getLeaderboard(authToken, date = null) {
  const dateParam = date || new Date().toISOString().split('T')[0];
  const response = await fetch(
    `http://localhost:5000/api/quizzes/daily/leaderboard?date=${dateParam}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );
  
  const data = await response.json();
  
  if (data.quizLive) {
    console.log('Quiz is still running...');
  } else {
    console.log(`Leaderboard for ${data.date}:`);
    data.leaderboard.forEach(entry => {
      console.log(
        `${entry.badge} ${entry.studentName} - ` +
        `${entry.correctAnswers}/${entry.totalQuestions} correct - ` +
        `${entry.totalPoints} points`
      );
    });
  }
  
  return data;
}

// ============================================================
// 5. GET: Quiz History
// ============================================================

/**
 * Endpoint: GET /api/quizzes/history
 * Access: Authenticated users (gets own history)
 * Query params: limit (default 10), offset (default 0)
 */

// cURL Example
/*
curl -X GET "http://localhost:5000/api/quizzes/history?limit=5&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
*/

// JavaScript Fetch Example
async function getQuizHistory(authToken, limit = 10, offset = 0) {
  const response = await fetch(
    `http://localhost:5000/api/quizzes/history?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );
  
  const data = await response.json();
  
  console.log(`Total Quizzes: ${data.totalQuizzes}`);
  data.quizzes.forEach(quiz => {
    console.log(`\nDate: ${quiz.date}`);
    console.log(`Rank: ${quiz.rank || 'Not ranked'}`);
    console.log(`Score: ${quiz.score.correctAnswers}/${quiz.score.totalQuestions}`);
    console.log(`Points: ${quiz.points}`);
    console.log(`Time: ${quiz.timeTaken}s`);
  });
  
  return data;
}

// ============================================================
// 6. GET: Specific Submission Details
// ============================================================

/**
 * Endpoint: GET /api/quizzes/submission/:submissionId
 * Access: Authenticated users (owner only)
 */

// cURL Example
/*
curl -X GET http://localhost:5000/api/quizzes/submission/submission_id_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
*/

// JavaScript Fetch Example
async function getSubmissionDetails(authToken, submissionId) {
  const response = await fetch(
    `http://localhost:5000/api/quizzes/submission/${submissionId}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    const sub = data.submission;
    console.log(`Date: ${sub.date}`);
    console.log(`Rank: ${sub.rank} ${sub.badge || ''}`);
    console.log(`Score: ${sub.score.correctAnswers}/${sub.score.totalQuestions}`);
    console.log(`Points: ${sub.points}`);
    
    console.log('\nQuestions:');
    sub.questions.forEach((q, idx) => {
      const status = q.isCorrect ? '✓' : '✗';
      console.log(`${idx + 1}. ${status} ${q.question}`);
      console.log(`   Your answer: ${q.studentAnswer}`);
      if (!q.isCorrect) {
        console.log(`   Correct: ${q.correctAnswer}`);
      }
    });
  }
  
  return data;
}

// ============================================================
// 7. GET: Top Performers
// ============================================================

/**
 * Endpoint: GET /api/quizzes/top-performers
 * Access: Authenticated users
 * Query params: limit (default 10)
 */

// cURL Example
/*
curl -X GET "http://localhost:5000/api/quizzes/top-performers?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
*/

// JavaScript Fetch Example
async function getTopPerformers(authToken, limit = 10) {
  const response = await fetch(
    `http://localhost:5000/api/quizzes/top-performers?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  );
  
  const data = await response.json();
  
  console.log('Top Performers:');
  data.topPerformers.forEach(performer => {
    console.log(`\n${performer.rank}. ${performer.studentName}`);
    console.log(`   Total Points: ${performer.totalPoints}`);
    console.log(`   Quizzes Attempted: ${performer.quizzesAttempted}`);
    console.log(`   Average Correct: ${performer.averageCorrect}`);
    console.log(`   🥇: ${performer.achievements.firstPlace}`);
    console.log(`   🥈: ${performer.achievements.secondPlace}`);
    console.log(`   🥉: ${performer.achievements.thirdPlace}`);
  });
  
  return data;
}

// ============================================================
// COMPLETE WORKFLOW TEST
// ============================================================

/**
 * Run this to test the complete flow
 * (Make sure you have admin and student tokens)
 */

async function testCompleteWorkflow(adminToken, studentToken, studentId, studentName) {
  console.log('=== DAILY QUIZ WORKFLOW TEST ===\n');
  
  try {
    // 1. Add questions (admin)
    console.log('1. Adding questions...');
    const questionResponse = await addQuestion(adminToken);
    console.log(questionResponse);
    console.log('✓ Question added\n');
    
    // 2. Get questions
    console.log('2. Getting questions...');
    const questionsData = await getQuestions(studentToken);
    const questionIds = questionsData.questions.map(q => q.id);
    console.log(`✓ Got ${questionsData.totalQuestions} questions\n`);
    
    // 3. Submit quiz
    console.log('3. Submitting quiz...');
    const responses = {};
    questionIds.forEach((id, idx) => {
      responses[id] = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    });
    
    const submissionData = await submitQuiz(
      studentToken,
      studentId,
      studentName,
      responses,
      45 // 45 seconds
    );
    console.log(`✓ Quiz submitted\n`);
    
    // 4. Get leaderboard
    console.log('4. Getting leaderboard...');
    const leaderboardData = await getLeaderboard(studentToken);
    console.log(`✓ Leaderboard loaded\n`);
    
    // 5. Get history
    console.log('5. Getting quiz history...');
    const historyData = await getQuizHistory(studentToken, 5);
    console.log(`✓ History loaded\n`);
    
    // 6. Get top performers
    console.log('6. Getting top performers...');
    const topPerformersData = await getTopPerformers(studentToken, 10);
    console.log('✓ Top performers loaded\n');
    
    console.log('=== WORKFLOW TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================
// ERROR RESPONSE EXAMPLES
// ============================================================

/**
 * Example error responses you might receive
 */

/*
// Duplicate submission
{
  "success": false,
  "error": "Duplicate submission detected. Student has already submitted for this quiz.",
  "existingSubmissionId": "sub_uuid_789"
}

// Quiz window closed
{
  "success": false,
  "error": "Quiz window has closed (ends at 8:02 PM)"
}

// Unauthorized
{
  "success": false,
  "error": "Not authorized, token failed"
}

// Not admin
{
  "success": false,
  "error": "Not authorized as admin"
}

// Missing fields
{
  "success": false,
  "error": "Missing required fields: studentId, studentName, date, responses, timeTaken, submittedAt"
}
*/

// ============================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================

export {
  addQuestion,
  getQuestions,
  submitQuiz,
  getLeaderboard,
  getQuizHistory,
  getSubmissionDetails,
  getTopPerformers,
  testCompleteWorkflow
};
