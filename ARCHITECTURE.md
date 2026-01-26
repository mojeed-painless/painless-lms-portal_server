# Daily Quiz Backend - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  QuizScreen, LeaderboardScreen, ProfileScreen              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST (JWT Token)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    Node.js/Express Server                    │
│                     server.js (PORT 5000)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
    ┌────────┐  ┌──────────┐  ┌─────────┐
    │ Routes │  │Middleware│  │ Cron Job│
    │        │  │          │  │ Scheduler
    │quiz    │  │protect   │  │(8:03 PM)
    │routes  │  │admin     │  └─────────┘
    └───┬────┘  └──────────┘
        │
        ↓
    ┌─────────────────────────┐
    │   Quiz Controller       │
    │ (quizController.js)     │
    │                         │
    │ 7 Main Functions:       │
    │ • addDailyQuestion      │
    │ • getTodayQuestions     │
    │ • submitQuiz            │
    │ • getDailyLeaderboard   │
    │ • getQuizHistory        │
    │ • getSubmissionDetails  │
    │ • getTopPerformers      │
    └────────┬────────────────┘
             │
        ┌────┴────┐
        ↓         ↓
    ┌──────────┐  ┌────────────────┐
    │ Helpers  │  │ Scheduler      │
    │          │  │                │
    │quizHelper│  │calculateDailyR │
    │.js       │  │ankings()       │
    │ • Time   │  │                │
    │ • Rank   │  │ Runs daily at  │
    │ • Calc   │  │ 8:03 PM        │
    └──────────┘  └────────────────┘
        │
        ↓
    ┌──────────────────────────────┐
    │   MongoDB Database           │
    │  (painless_lms)              │
    │                              │
    │  Collections:                │
    │  • users                     │
    │  • courses                   │
    │  • daily_quizzes       ✨NEW │
    │  • quiz_submissions    ✨NEW │
    │  • assignments               │
    │  • lessons                   │
    │  • progress                  │
    └──────────────────────────────┘
```

---

## Request/Response Flow

### 1. Add Question (Admin)
```
Admin Frontend
    │
    ├─→ Check if 8:00-8:02 PM
    │
    └─→ POST /api/quizzes/daily/add-question
        │
        ├─→ [protect] Check JWT token
        │
        ├─→ [admin] Check admin role
        │
        ├─→ addDailyQuestion()
        │   ├─→ Validate fields
        │   ├─→ Check quiz window
        │   ├─→ Find/Create DailyQuiz doc
        │   ├─→ Add question to array
        │   └─→ Save to MongoDB
        │
        └─→ Response: {
              success: true,
              questionId: "q_123",
              totalQuestionsToday: 2
            }
```

### 2. Get Questions (Student)
```
Student Frontend
    │
    └─→ GET /api/quizzes/daily/questions
        │
        ├─→ [protect] Check JWT token
        │
        ├─→ getTodayQuestions()
        │   ├─→ Get today's date (YYYY-MM-DD)
        │   ├─→ Query DailyQuiz collection
        │   ├─→ Format questions
        │   ├─→ Check if quiz window active
        │   └─→ Hide/Show correctAnswer based on time
        │
        └─→ Response: {
              date: "2026-01-25",
              questions: [...],
              totalQuestions: 3,
              quizLive: true,
              timeRemaining: 75
            }
```

### 3. Submit Quiz (Student)
```
Student Frontend
    │
    ├─→ Click "Finish Quiz"
    │
    └─→ POST /api/quizzes/daily/submit
        │
        ├─→ [protect] Check JWT token
        │
        ├─→ submitQuiz()
        │   ├─→ Validate: all required fields ✓
        │   ├─→ Validate: submission within window ✓
        │   ├─→ Validate: time taken (5-120s) ✓
        │   ├─→ Check: duplicate submission ✓
        │   ├─→ Fetch today's questions
        │   ├─→ Loop through responses
        │   │   ├─→ Find question in database
        │   │   ├─→ Compare: student answer vs correct
        │   │   └─→ Increment correctAnswers if match
        │   ├─→ Calculate percentage
        │   ├─→ Create QuizSubmission document
        │   │   ├─→ studentId
        │   │   ├─→ date
        │   │   ├─→ responses (Map)
        │   │   ├─→ correctAnswers
        │   │   ├─→ timeTaken
        │   │   └─→ rank: null (calculated later)
        │   └─→ Save to MongoDB
        │
        └─→ Response: {
              success: true,
              submissionId: "sub_456",
              score: {
                correctAnswers: 2,
                totalQuestions: 3,
                percentage: 67
              }
            }
```

### 4. Automatic Ranking (Cron Job @ 8:03 PM)
```
8:03 PM - Cron Job Triggers
    │
    └─→ calculateDailyRankings()
        │
        ├─→ Get today's date
        │
        ├─→ Fetch all QuizSubmission docs
        │   └─→ WHERE date = today AND rankingCalculated = false
        │
        ├─→ calculateRankings() - Sort:
        │   ├─→ Primary: correctAnswers DESC
        │   └─→ Secondary: timeTaken ASC
        │
        ├─→ Result array with calculated ranks:
        │   [
        │     { rank: 1, correctAnswers: 3, timeTaken: 45 },
        │     { rank: 2, correctAnswers: 3, timeTaken: 67 },
        │     { rank: 3, correctAnswers: 2, timeTaken: 50 }
        │   ]
        │
        ├─→ For each submission:
        │   ├─→ Calculate bonusPoints (5/3/1/0)
        │   ├─→ Calculate totalPoints (bonus + correct)
        │   ├─→ Assign badge (🥇/🥈/🥉)
        │   └─→ Set rankingCalculated = true
        │
        ├─→ Bulk update MongoDB
        │   └─→ One update per submission
        │
        └─→ Log: "Successfully ranked X submissions"
```

### 5. View Leaderboard (Student)
```
During Quiz (8:00-8:02 PM)
    │
    └─→ GET /api/quizzes/daily/leaderboard
        │
        ├─→ [protect] Check JWT token
        │
        ├─→ getDailyLeaderboard()
        │   ├─→ Check quiz window
        │   └─→ Return: quizLive: true, empty array
        │
        └─→ Response: {
              quizLive: true,
              leaderboard: [],
              message: "Leaderboard available after 8:02 PM"
            }

─────────────────────────────────────

After Quiz (8:02+ PM)
    │
    └─→ GET /api/quizzes/daily/leaderboard
        │
        ├─→ [protect] Check JWT token
        │
        ├─→ getDailyLeaderboard()
        │   ├─→ Check quiz window (closed)
        │   ├─→ Fetch today's submissions
        │   ├─→ Verify ranked (if not, run ranking)
        │   ├─→ Bulk update any unranked
        │   └─→ Return top 3
        │
        └─→ Response: {
              quizLive: false,
              leaderboard: [
                {
                  rank: 1,
                  studentName: "Alice",
                  correctAnswers: 3,
                  bonusPoints: 5,
                  totalPoints: 8,
                  badge: "🥇"
                },
                // ... rank 2, rank 3
              ]
            }
```

### 6. View Quiz History (Student)
```
Student Frontend
    │
    └─→ GET /api/quizzes/history?limit=10&offset=0
        │
        ├─→ [protect] Check JWT token
        │   └─→ Extract student ID from token
        │
        ├─→ getQuizHistory()
        │   ├─→ Query QuizSubmission collection
        │   │   └─→ WHERE studentId = req.user._id
        │   ├─→ Sort by date DESC
        │   ├─→ Apply pagination (limit, offset)
        │   ├─→ For each submission:
        │   │   ├─→ Fetch DailyQuiz document
        │   │   ├─→ Map questions to responses
        │   │   ├─→ Compare answers
        │   │   └─→ Mark correct/incorrect
        │   └─→ Return detailed quizzes
        │
        └─→ Response: {
              totalQuizzes: 5,
              quizzes: [
                {
                  date: "2026-01-25",
                  rank: 2,
                  points: 6,
                  questions: [
                    {
                      question: "...",
                      studentAnswer: "A",
                      correctAnswer: "A",
                      isCorrect: true
                    }
                  ]
                }
              ]
            }
```

---

## Database Schema Relationships

```
┌──────────────────────────────┐
│         User (existing)       │
│      ┌──────────────────┐     │
│      │ _id              │     │
│      │ firstName        │     │
│      │ lastName         │     │
│      │ email            │     │
│      │ role (admin...)  │     │
│      └──────────────────┘     │
└──────────────┬────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
        │         ┌──────────────────────────┐
        │         │  QuizSubmission (NEW)   │
        │         │  ┌────────────────────┐ │
        │         │  │ studentId [ref] ──┼──→ User
        │         │  │ studentName      │ │
        │         │  │ date             │ │
        │         │  │ responses (Map)  │ │
        │         │  │ timeTaken        │ │
        │         │  │ correctAnswers   │ │
        │         │  │ rank             │ │
        │         │  │ totalPoints      │ │
        │         │  │ badge            │ │
        │         │  └────────────────────┘ │
        │         └──────┬───────────────────┘
        │                │ (date matches)
        │                ↓
        ├────→ ┌──────────────────────────┐
               │   DailyQuiz (NEW)       │
               │  ┌────────────────────┐ │
               │  │ date (unique)      │ │
               │  │ questions: [       │ │
               │  │   {                │ │
               │  │     _id            │ │
               │  │     question       │ │
               │  │     options        │ │
               │  │     correctAnswer  │ │
               │  │     addedAt        │ │
               │  │   }                │ │
               │  │ ]                  │ │
               │  │ isActive           │ │
               │  └────────────────────┘ │
               └────────────────────────┘

Relationship: QuizSubmission.date ←→ DailyQuiz.date
```

---

## Data Types & Constraints

### DailyQuiz Collection
```javascript
{
  date: String (YYYY-MM-DD),           // Unique constraint
  questions: [
    {
      _id: ObjectId,                   // MongoDB ObjectId
      question: String,                // Required, max 500 chars
      image: String (URL),             // Optional
      options: {
        A: String,                     // Required, max 200 chars
        B: String,                     // Required, max 200 chars
        C: String,                     // Required, max 200 chars
        D: String                      // Required, max 200 chars
      },
      correctAnswer: String,           // Enum: ['A', 'B', 'C', 'D']
      addedAt: Date                    // Server-generated
    }
  ],
  isActive: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### QuizSubmission Collection
```javascript
{
  studentId: ObjectId,                 // Reference to User
  studentName: String,                 // Denormalized (for history)
  date: String (YYYY-MM-DD),           // Composite unique with studentId
  responses: Map<String, String>,      // QuestionId → Answer (A|B|C|D)
  timeTaken: Number,                   // Constraint: 5 ≤ value ≤ 120
  submittedAt: Date,                   // Must be within 8:00-8:02 PM
  correctAnswers: Number,              // 0 to totalQuestions
  totalQuestions: Number,              // Copy from DailyQuiz
  percentage: Number,                  // 0 to 100
  rank: Number,                        // 1, 2, 3, 4+ (null until ranked)
  bonusPoints: Number,                 // 5, 3, 1, or 0
  totalPoints: Number,                 // bonusPoints + correctAnswers
  badge: String,                       // "🥇 1st Place" or null
  rankingCalculated: Boolean,          // Prevent re-ranking
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Indexes for Performance

```javascript
// DailyQuiz Indexes
db.daily_quizzes.createIndex({ date: 1 }, { unique: true })
// Purpose: Fast lookup by date, ensures one quiz per day

// QuizSubmission Indexes
db.quiz_submissions.createIndex({ studentId: 1, date: 1 }, { unique: true })
// Purpose: Prevent duplicate submissions, fast student lookup

db.quiz_submissions.createIndex({ date: 1 })
// Purpose: Fast leaderboard queries by date

db.quiz_submissions.createIndex({ date: 1, rank: 1 })
// Purpose: Fast top 3 retrieval
```

---

## Timeline & Automation

```
Daily Schedule
──────────────────────────────────────────────────

00:00 AM
├─ [Passive] Waiting for 8:00 PM

...

07:59 PM
├─ [Passive] Approaching quiz time

8:00 PM (20:00:00)
├─ [ACTIVE] Quiz window OPENS
├─ Admin can POST /api/quizzes/daily/add-question
├─ Questions added to DailyQuiz collection
├─ Students can GET /api/quizzes/daily/questions
├─ Correct answers NOT visible
├─ Students can POST /api/quizzes/daily/submit
├─ Submissions saved with rank = null
│
└─ 2 minutes pass (120 seconds)

8:02 PM (20:02:00)
├─ [CLOSED] Quiz window CLOSES
├─ No more submissions accepted
├─ Correct answers NOW visible
├─ GET /api/quizzes/daily/leaderboard returns empty
│
└─ 1 minute passes

8:03 PM (20:03:00)
├─ [AUTOMATIC] Cron job triggers
├─ calculateDailyRankings() executes
│ ├─ Fetch all submissions for today
│ ├─ Sort by correctAnswers DESC, timeTaken ASC
│ ├─ Assign ranks (1, 2, 3, 4+)
│ ├─ Calculate bonusPoints & totalPoints
│ ├─ Bulk update database
│ └─ Log completion
├─ GET /api/quizzes/daily/leaderboard NOW shows top 3
│
└─ Leaderboard visible until next day

...

23:59 PM
├─ [Passive] End of day
└─ Quiz history saves permanently

00:00 AM (Next Day)
├─ [REPEAT] Cycle begins again
└─ [Passive] Waiting for next 8:00 PM
```

---

## State Machine

```
                ┌─────────────────────┐
                │   Quiz Not Ready    │ (Before 8:00 PM)
                │                     │
                │ • No questions      │
                │ • No submissions    │
                │ • Empty leaderboard │
                └────────────┬────────┘
                             │
                     8:00 PM Arrives
                             │
                             ↓
                ┌─────────────────────┐
                │   Quiz Window Open  │ (8:00-8:02 PM)
                │                     │
                │ • Admin adds Q's    │
                │ • Students see Q's  │
                │ • No answers shown  │
                │ • Submissions ok    │
                │ • Empty leaderboard │
                └────────────┬────────┘
                             │
                     8:02 PM Arrives
                             │
                             ↓
                ┌─────────────────────┐
                │   Quiz Window Close │ (8:02+ PM, before 8:03 PM)
                │                     │
                │ • No more adding Q's│
                │ • No submissions    │
                │ • Answers visible   │
                │ • Empty leaderboard │
                └────────────┬────────┘
                             │
                     8:03 PM Arrives
                             │
                     Cron Job Triggers
                             │
                             ↓
                ┌─────────────────────┐
                │  Quiz Ranked        │ (After 8:03 PM)
                │                     │
                │ • Answers visible   │
                │ • Leaderboard ready │
                │ • History saved     │
                │ • Badges assigned   │
                └────────────┬────────┘
                             │
                     Next Day Arrives
                             │
                        Loop back
```

---

## Error Handling Flow

```
Request Received
    │
    ├─→ [protect] middleware
    │   └─→ Fail: Return 401 "Not authorized"
    │
    ├─→ [admin] middleware (if needed)
    │   └─→ Fail: Return 403 "Not authorized as admin"
    │
    ├─→ Controller function
    │   │
    │   ├─→ Validate required fields
    │   │   └─→ Fail: Return 400 "Missing fields"
    │   │
    │   ├─→ Validate quiz window
    │   │   └─→ Fail: Return 400 "Quiz window closed"
    │   │
    │   ├─→ Validate data (time, answers, etc.)
    │   │   └─→ Fail: Return 400 "Invalid data"
    │   │
    │   ├─→ Database query
    │   │   └─→ Fail: Return 404 "Not found"
    │   │
    │   ├─→ Business logic
    │   │   └─→ Fail: Return appropriate error
    │   │
    │   └─→ Success
    │       └─→ Return 200/201 with data
    │
    └─→ [errorHandler] middleware
        └─→ Catch-all error handler
```

---

## Security Layers

```
1. Transport Layer
   └─→ HTTPS (in production)

2. Authentication Layer
   └─→ JWT token verification
       └─→ Decode token
       └─→ Verify signature
       └─→ Get user from token

3. Authorization Layer
   ├─→ Admin role check
   ├─→ Student owns data check
   └─→ Ownership validation

4. Validation Layer
   ├─→ Required field validation
   ├─→ Data type validation
   ├─→ Range validation (time 5-120)
   ├─→ Option validation (A|B|C|D)
   └─→ Constraint validation (unique date per student)

5. Business Logic Layer
   ├─→ Quiz window time check
   ├─→ Duplicate submission check
   ├─→ Server-side answer validation
   └─→ Secure answer exposure

6. Database Layer
   ├─→ Unique constraints
   ├─→ Required field enforcement
   └─→ Index optimization
```

---

This architecture provides:
✅ Clear separation of concerns
✅ Automatic daily scheduling
✅ Real-time quiz management
✅ Secure data handling
✅ Optimized performance
✅ Complete audit trail
