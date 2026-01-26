# Daily Quiz Backend - Setup & Implementation

## Quick Start

### 1. Install Cron Package
```bash
npm install node-cron
```

### 2. Files Created
✅ **Models:**
- `src/models/DailyQuiz.js` - Daily quiz questions storage
- `src/models/QuizSubmission.js` - Student submissions & rankings

✅ **Controllers:**
- `src/controllers/quizController.js` - All quiz logic

✅ **Routes:**
- `src/routes/quizRoutes.js` - All quiz endpoints

✅ **Utilities:**
- `src/utils/quizHelper.js` - Time checking, ranking, validation
- `src/utils/scheduler.js` - Automatic ranking cron job

✅ **Configuration:**
- `package.json` - Updated with `node-cron` dependency
- `server.js` - Integrated quiz routes and scheduler

---

## API Endpoints Summary

### For Admin (Add Questions)
```
POST /api/quizzes/daily/add-question
- Only available 8:00-8:02 PM
- Requires admin role
```

### For Students
```
GET  /api/quizzes/daily/questions     - Get today's questions
POST /api/quizzes/daily/submit        - Submit answers (8:00-8:02 PM only)
GET  /api/quizzes/daily/leaderboard   - View top 3 after quiz ends
GET  /api/quizzes/history             - View personal quiz history
GET  /api/quizzes/submission/:id      - View specific submission
GET  /api/quizzes/top-performers      - View global top performers
```

---

## Key Features Implemented

### ✅ Quiz Window Management
- 8:00 PM - 8:02 PM (120 seconds) active window
- Server-side time checking (prevents cheating)
- Automatic closure at 8:02 PM

### ✅ Security
- Duplicate submission prevention
- JWT authentication on all endpoints
- Admin-only question additions
- Students can't view other students' answers
- Server-side answer validation
- Time-based validation (5-120 seconds)

### ✅ Ranking System
- Primary sort: Correct answers (DESC)
- Secondary sort: Time taken (ASC)
- Automatic calculation at 8:03 PM via cron job
- Bonus points: 5 (1st), 3 (2nd), 1 (3rd), 0 (4th+)
- Total points = bonus + correct answers

### ✅ Leaderboard
- Shows only top 3 after quiz ends
- Displays badges (🥇🥈🥉)
- All participants see same rankings
- Empty during quiz window

### ✅ Quiz History
- Stores all past attempts
- Shows correct/incorrect answers after quiz ends
- Pagination support (limit, offset)
- Per-student view

---

## Data Flow

### Adding Questions (Admin)
```
Admin enters question
    ↓
Check if 8:00-8:02 PM ✓
    ↓
Validate fields ✓
    ↓
Find/Create today's DailyQuiz document
    ↓
Add question to array
    ↓
Save and return success
```

### Student Taking Quiz
```
Student fetches questions at 8:00 PM
    ↓
Questions shown WITHOUT correctAnswer
    ↓
Student selects answers
    ↓
Student submits before 8:02 PM
    ↓
Check if in quiz window ✓
    ↓
Check for duplicate submission ✓
    ↓
Calculate correct answers
    ↓
Save submission (rank=null initially)
    ↓
Return score and detailedResponses
```

### Ranking Calculation (Automatic at 8:03 PM)
```
Cron job triggers at 8:03 PM
    ↓
Fetch all submissions for today
    ↓
Sort by: correctAnswers DESC, timeTaken ASC
    ↓
Calculate bonusPoints based on rank
    ↓
Bulk update all submissions with rankings
    ↓
Log top 3 for verification
```

### Viewing Leaderboard
```
During quiz (8:00-8:02 PM)
    ↓
Return empty leaderboard + message
    
After quiz (8:02+ PM)
    ↓
Fetch submissions with rankings
    ↓
Return top 3 with badges and points
```

---

## Database Queries Optimized

### Indexes Created
1. `DailyQuiz.date` (unique)
2. `QuizSubmission.studentId + date` (unique) - Prevent duplicates
3. `QuizSubmission.date` - Fast leaderboard queries
4. `QuizSubmission.date + rank` - Fast top 3 retrieval

---

## Configuration Notes

### Timezone
- All times use server timezone
- Quiz window: 8:00 PM - 8:02 PM (20:00 - 20:02 in 24h format)
- Cron job runs at 8:03 PM (20:03)
- Modify `quizHelper.js` if different timezone needed

### Quiz Duration
- Currently set to 2 minutes (120 seconds)
- Change window in `quizHelper.js` `getQuizWindowStatus()`

### Bonus Points Structure
- Can be customized in `quizHelper.js` `calculateBonusPoints()`

---

## Testing the Implementation

### Test Case 1: Add Question (Admin)
```javascript
// Before 8:00 PM or after 8:02 PM → Error
// During 8:00-8:02 PM → Success

const testAddQuestion = async () => {
  const response = await fetch('/api/quizzes/daily/add-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      question: "What is JavaScript?",
      optionA: "A programming language",
      optionB: "A markup language",
      optionC: "A styling language",
      optionD: "None",
      correctAnswer: "A"
    })
  });
  console.log(await response.json());
};
```

### Test Case 2: Get Questions
```javascript
const testGetQuestions = async () => {
  const response = await fetch('/api/quizzes/daily/questions', {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const data = await response.json();
  console.log(`Questions: ${data.totalQuestions}`);
  console.log(`Quiz Live: ${data.quizLive}`);
  console.log(`Time Remaining: ${data.timeRemaining}s`);
};
```

### Test Case 3: Submit Quiz
```javascript
const testSubmitQuiz = async () => {
  const response = await fetch('/api/quizzes/daily/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      studentId: student._id,
      studentName: "John Doe",
      date: "2026-01-25",
      responses: {
        "q_uuid_1": "A",
        "q_uuid_2": "B"
      },
      timeTaken: 45,
      submittedAt: new Date().toISOString()
    })
  });
  const data = await response.json();
  console.log(`Correct: ${data.score.correctAnswers}/${data.score.totalQuestions}`);
};
```

### Test Case 4: View Leaderboard (After 8:02 PM)
```javascript
const testLeaderboard = async () => {
  const response = await fetch('/api/quizzes/daily/leaderboard', {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const data = await response.json();
  if (data.quizLive) {
    console.log("Quiz still running...");
  } else {
    data.leaderboard.forEach(entry => {
      console.log(`${entry.rank}. ${entry.studentName} - ${entry.totalPoints} pts`);
    });
  }
};
```

### Test Case 5: View History
```javascript
const testHistory = async () => {
  const response = await fetch('/api/quizzes/history', {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const data = await response.json();
  console.log(`Total Quizzes: ${data.totalQuizzes}`);
  data.quizzes.forEach(quiz => {
    console.log(`${quiz.date} - Rank: ${quiz.rank}, Points: ${quiz.points}`);
  });
};
```

---

## Frontend Integration Points

### In QuizScreen.jsx

**1. Fetch questions when quiz starts:**
```javascript
useEffect(() => {
  if (isQuizTime) {
    fetch('/api/quizzes/daily/questions', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(r => r.json())
    .then(data => {
      setQuestions(data.questions);
      setTimeRemaining(data.timeRemaining);
      setQuizLive(data.quizLive);
    });
  }
}, []);
```

**2. Submit quiz on finish:**
```javascript
const handleFinishQuiz = async () => {
  const response = await fetch('/api/quizzes/daily/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      studentId: user._id,
      studentName: `${user.firstName} ${user.lastName}`,
      date: new Date().toISOString().split('T')[0],
      responses: quizResponses,
      timeTaken: Math.floor((Date.now() - quizStartTime) / 1000),
      submittedAt: new Date().toISOString()
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    setSubmissionSuccess(true);
    setQuizScore(data.score);
  }
};
```

**3. Load leaderboard after quiz ends:**
```javascript
const loadLeaderboard = async () => {
  const response = await fetch(
    `/api/quizzes/daily/leaderboard?date=${todayDate}`,
    {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }
  );
  const data = await response.json();
  setLeaderboard(data.leaderboard);
};
```

**4. Load history on profile page:**
```javascript
const loadQuizHistory = async () => {
  const response = await fetch('/api/quizzes/history?limit=20', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await response.json();
  setHistoryQuizzes(data.quizzes);
};
```

---

## Common Issues & Solutions

### Issue: Questions always return empty
**Solution:** Check if admin added questions during 8:00-8:02 PM window

### Issue: Rankings not showing
**Solution:** Wait until 8:03 PM for cron job to run, or check logs

### Issue: Duplicate submission error
**Solution:** This is expected! Return existing submission instead of allowing new one

### Issue: Correct answers showing during quiz
**Solution:** Verify quiz window check in `getTodayQuestions()` controller

### Issue: Time validation failing
**Solution:** Ensure `submittedAt` is in ISO format and within quiz window

---

## Production Checklist

- [ ] Install `node-cron` package
- [ ] Update `server.js` with scheduler import ✓
- [ ] Test quiz window times match requirements
- [ ] Verify cron job logs in console
- [ ] Test duplicate prevention
- [ ] Verify JWT authentication works
- [ ] Test admin role authorization
- [ ] Confirm database indexes created
- [ ] Test with real submission flow
- [ ] Monitor leaderboard calculations
- [ ] Check quiz history pagination
- [ ] Validate all error responses

---

## Summary

The daily quiz backend is now **fully implemented** with:
- ✅ Two new models (DailyQuiz, QuizSubmission)
- ✅ Seven complete API endpoints
- ✅ Automatic ranking via cron job
- ✅ Full security and validation
- ✅ Quiz history and leaderboard
- ✅ Ready for frontend integration

Just run `npm install` to get `node-cron`, then start the server!
