# Daily Quiz Backend Integration Guide

## Overview
This document provides a complete guide for the Daily Quiz backend implementation. The feature follows a specific 2-minute quiz window from 8:00 PM to 8:02 PM daily, with automated ranking and scoring.

---

## Database Models

### 1. DailyQuiz Model (`src/models/DailyQuiz.js`)
Stores all questions for a specific date.

**Schema:**
```
{
  date: String (YYYY-MM-DD),           // Unique identifier for each day
  questions: [{
    _id: ObjectId,
    question: String,
    image: String (URL),               // Optional image
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer: String (A|B|C|D),
    addedAt: Date
  }],
  isActive: Boolean,                   // True during quiz window
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `date` (unique)

---

### 2. QuizSubmission Model (`src/models/QuizSubmission.js`)
Stores student quiz submissions and rankings.

**Schema:**
```
{
  studentId: ObjectId (ref: User),
  studentName: String,
  date: String (YYYY-MM-DD),
  responses: Map<String, String>,      // questionId -> answer (A|B|C|D)
  timeTaken: Number (seconds),
  submittedAt: Date,
  correctAnswers: Number,
  totalQuestions: Number,
  percentage: Number,
  rank: Number (1, 2, 3, ...),
  bonusPoints: Number (5|3|1|0),
  totalPoints: Number,                 // bonusPoints + correctAnswers
  badge: String (🥇|🥈|🥉),
  rankingCalculated: Boolean
}
```

**Indexes:**
- `(studentId, date)` (unique) - Prevent duplicate submissions
- `date`
- `(date, rank)`

---

## API Endpoints

### 1. POST `/api/quizzes/daily/add-question`
**Access:** Admin only (during quiz window 8:00-8:02 PM)

**Request:**
```json
{
  "question": "What is React?",
  "optionA": "A library for building UIs",
  "optionB": "A programming language",
  "optionC": "A database",
  "optionD": "A server framework",
  "correctAnswer": "A",
  "image": File (optional)
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Question added successfully",
  "questionId": "uuid_1234",
  "date": "2026-01-25",
  "totalQuestionsToday": 2
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Questions can only be added during quiz window (8:00 PM - 8:02 PM)"
}
```

---

### 2. GET `/api/quizzes/daily/questions`
**Access:** Authenticated users

**Response (200) - During Quiz (8:00-8:02 PM):**
```json
{
  "success": true,
  "date": "2026-01-25",
  "questions": [
    {
      "id": "q_uuid_1",
      "question": "What is React?",
      "image": "https://cdn.example.com/image.png",
      "options": {
        "A": "A library for building UIs",
        "B": "A programming language",
        "C": "A database",
        "D": "A server framework"
      }
    }
  ],
  "totalQuestions": 3,
  "quizLive": true,
  "timeRemaining": 75
}
```

**Response (200) - After Quiz (8:02+ PM):**
```json
{
  "success": true,
  "date": "2026-01-25",
  "questions": [
    {
      "id": "q_uuid_1",
      "question": "What is React?",
      "image": "https://cdn.example.com/image.png",
      "options": {
        "A": "A library for building UIs",
        "B": "A programming language",
        "C": "A database",
        "D": "A server framework"
      },
      "correctAnswer": "A"
    }
  ],
  "totalQuestions": 3,
  "quizLive": false,
  "timeRemaining": 0
}
```

---

### 3. POST `/api/quizzes/daily/submit`
**Access:** Authenticated users (only during quiz window)

**Request:**
```json
{
  "studentId": "student_uuid_123",
  "studentName": "John Doe",
  "date": "2026-01-25",
  "responses": {
    "q_uuid_1": "A",
    "q_uuid_2": "B",
    "q_uuid_3": "C"
  },
  "timeTaken": 45,
  "submittedAt": "2026-01-25T20:01:30.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "submissionId": "sub_uuid_456",
  "score": {
    "correctAnswers": 2,
    "totalQuestions": 3,
    "percentage": 67
  },
  "provisionalRank": null
}
```

**Error (400) - Quiz Closed:**
```json
{
  "success": false,
  "error": "Quiz window has closed (ends at 8:02 PM)"
}
```

**Error (400) - Duplicate Submission:**
```json
{
  "success": false,
  "error": "Duplicate submission detected. Student has already submitted for this quiz.",
  "existingSubmissionId": "sub_uuid_789"
}
```

---

### 4. GET `/api/quizzes/daily/leaderboard?date=2026-01-25`
**Access:** Authenticated users

**Response (200) - During Quiz:**
```json
{
  "success": true,
  "date": "2026-01-25",
  "quizLive": true,
  "leaderboard": [],
  "message": "Leaderboard will be available after quiz ends at 8:02 PM",
  "totalParticipants": 5
}
```

**Response (200) - After Quiz:**
```json
{
  "success": true,
  "date": "2026-01-25",
  "quizLive": false,
  "leaderboard": [
    {
      "rank": 1,
      "studentId": "student_uuid_001",
      "studentName": "Alice Johnson",
      "correctAnswers": 3,
      "totalQuestions": 3,
      "percentage": 100,
      "timeTaken": 45,
      "submittedAt": "2026-01-25T20:00:45.000Z",
      "bonusPoints": 5,
      "totalPoints": 8,
      "badge": "🥇 1st Place"
    },
    {
      "rank": 2,
      "studentId": "student_uuid_002",
      "studentName": "Bob Smith",
      "correctAnswers": 3,
      "totalQuestions": 3,
      "percentage": 100,
      "timeTaken": 67,
      "submittedAt": "2026-01-25T20:01:07.000Z",
      "bonusPoints": 3,
      "totalPoints": 6,
      "badge": "🥈 2nd Place"
    },
    {
      "rank": 3,
      "studentId": "student_uuid_003",
      "studentName": "Carol Davis",
      "correctAnswers": 2,
      "totalQuestions": 3,
      "percentage": 67,
      "timeTaken": 50,
      "submittedAt": "2026-01-25T20:00:50.000Z",
      "bonusPoints": 1,
      "totalPoints": 3,
      "badge": "🥉 3rd Place"
    }
  ],
  "totalParticipants": 47,
  "calculatedAt": "2026-01-25T20:02:01.000Z"
}
```

---

### 5. GET `/api/quizzes/history?limit=10&offset=0`
**Access:** Authenticated users (gets their own history)

**Response (200):**
```json
{
  "success": true,
  "studentId": "student_uuid_123",
  "totalQuizzes": 5,
  "quizzes": [
    {
      "id": "sub_uuid_789",
      "date": "2026-01-25",
      "questions": [
        {
          "questionId": "q_uuid_1",
          "question": "What is React?",
          "image": "https://cdn.example.com/image.png",
          "options": {
            "A": "A library for building UIs",
            "B": "A programming language",
            "C": "A database",
            "D": "A server framework"
          },
          "studentAnswer": "A",
          "correctAnswer": "A",
          "isCorrect": true
        }
      ],
      "score": {
        "correctAnswers": 2,
        "totalQuestions": 3,
        "percentage": 67
      },
      "timeTaken": 45,
      "rank": 2,
      "points": 6,
      "bonusPoints": 3,
      "submittedAt": "2026-01-25T20:01:30.000Z"
    }
  ]
}
```

---

### 6. GET `/api/quizzes/submission/:submissionId`
**Access:** Authenticated users (can only view own submissions)

**Response (200):**
```json
{
  "success": true,
  "submission": {
    "id": "sub_uuid_456",
    "date": "2026-01-25",
    "questions": [...],
    "score": {...},
    "rank": 2,
    "points": 6,
    "badge": "🥈 2nd Place"
  }
}
```

---

### 7. GET `/api/quizzes/top-performers?limit=10`
**Access:** Authenticated users

**Response (200):**
```json
{
  "success": true,
  "topPerformers": [
    {
      "rank": 1,
      "studentId": "student_uuid_001",
      "studentName": "Alice Johnson",
      "totalPoints": 45,
      "quizzesAttempted": 10,
      "averageCorrect": "2.90",
      "achievements": {
        "firstPlace": 5,
        "secondPlace": 3,
        "thirdPlace": 2
      }
    }
  ]
}
```

---

## Quiz Window Rules

### Time Window
- **Start:** 8:00 PM (20:00:00)
- **End:** 8:02 PM (20:02:00)
- **Duration:** 120 seconds (2 minutes)

### Window State Changes
1. **8:00 PM** - Questions appear on frontend, students can submit answers
2. **8:02 PM** - Quiz window closes, correctAnswers hidden
3. **8:03 PM** - Cron job runs and calculates rankings (automatic)

---

## Ranking Algorithm

### Sorting Criteria (Applied After 8:02 PM)
1. **Primary:** `correctAnswers DESC` (most correct first)
2. **Secondary:** `timeTaken ASC` (fastest first)

### Scoring System
| Rank | Bonus Points | Total Points Formula |
|------|--------------|---------------------|
| 1st  | 5 pts        | 5 + correctAnswers  |
| 2nd  | 3 pts        | 3 + correctAnswers  |
| 3rd  | 1 pts        | 1 + correctAnswers  |
| 4+   | 0 pts        | 0 + correctAnswers  |

### Example
```
If 3 questions, student gets 3 correct:
- 1st place: 5 + 3 = 8 points (badge: 🥇)
- 2nd place: 3 + 3 = 6 points (badge: 🥈)
- 3rd place: 1 + 3 = 4 points (badge: 🥉)
- 4th+ place: 0 + 3 = 3 points (no badge)
```

---

## Security Features

### 1. Duplicate Prevention
- Unique constraint on `(studentId, date)`
- Returns existing submission if duplicate attempt

### 2. Answer Validation
- Server-side validation of all answers
- Prevents exposure of correct answers during quiz window
- Validates against question database

### 3. Time Validation
- Submission timestamp must be within 8:00-8:02 PM
- Time taken must be between 5-120 seconds
- Prevents late submissions and unrealistic times

### 4. Authentication
- All endpoints require JWT token
- Admin endpoints require admin role
- Students can only view their own submission details

### 5. Authorization
- Students cannot view other students' submissions
- Only admins can add questions
- Ranking is transparent (all participants see same rankings)

---

## Cron Job Setup

### Installation
```bash
npm install node-cron
```

### In server.js
```javascript
import { scheduleDailyRankingCalculation } from './src/utils/scheduler.js';

// After app initialization
scheduleDailyRankingCalculation();
```

### Automatic Execution
- Runs daily at **8:03 PM** (20:03:00)
- Calculates rankings for all submissions received during 8:00-8:02 PM window
- Updates database with rank, bonusPoints, totalPoints, and badge

---

## Frontend Integration

### 1. Admin - Add Questions
```javascript
const addQuestion = async (formData) => {
  const response = await fetch('/api/quizzes/daily/add-question', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData  // FormData with file
  });
  return response.json();
};
```

### 2. Student - Get Questions
```javascript
const getQuestions = async () => {
  const response = await fetch('/api/quizzes/daily/questions', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const data = await response.json();
  return {
    questions: data.questions,
    timeRemaining: data.timeRemaining,
    quizLive: data.quizLive
  };
};
```

### 3. Student - Submit Quiz
```javascript
const submitQuiz = async (responses, timeTaken) => {
  const response = await fetch('/api/quizzes/daily/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      studentId: user._id,
      studentName: user.firstName + ' ' + user.lastName,
      date: getTodayDate(),
      responses,
      timeTaken,
      submittedAt: new Date().toISOString()
    })
  });
  return response.json();
};
```

### 4. View Leaderboard
```javascript
const getLeaderboard = async () => {
  const response = await fetch('/api/quizzes/daily/leaderboard', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  return response.json();
};
```

### 5. View Quiz History
```javascript
const getHistory = async () => {
  const response = await fetch('/api/quizzes/history', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  return response.json();
};
```

---

## Error Handling

### Common Errors

| Error | Status | Solution |
|-------|--------|----------|
| Quiz window closed | 400 | Submit only 8:00-8:02 PM |
| Duplicate submission | 400 | Check existing submission |
| Missing fields | 400 | Validate request format |
| Not authenticated | 401 | Provide valid JWT token |
| Not authorized | 403 | User not admin or owns resource |
| Not found | 404 | Check IDs and date format |

---

## Testing Checklist

- [ ] Admin can add questions 8:00-8:02 PM only
- [ ] Questions hidden correctAnswer until quiz ends
- [ ] Students can only submit 8:00-8:02 PM
- [ ] Duplicate submissions blocked
- [ ] Ranking calculated correctly after 8:02 PM
- [ ] Top 3 appear on leaderboard with badges
- [ ] Points calculated correctly
- [ ] Quiz history shows all past quizzes
- [ ] Students cannot view other submissions
- [ ] Time window checked server-side (not client)

---

## Notes

- All times are server-side (prevents client-side cheating)
- Ranking is automatic via cron job
- Quiz data persists for history/analytics
- Leaderboard is visible to all authenticated users
- Top performers ranking is global across all quizzes
