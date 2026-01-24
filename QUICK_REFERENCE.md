# ASSIGNMENT SYSTEM - QUICK REFERENCE GUIDE

## 🎯 System Overview

```
STUDENTS                          ADMIN
   │                               │
   ├─ View Pending Assignments    ├─ Create Assignments
   │  (GET /student/pending)       │  (POST /)
   │                               │
   ├─ Submit Assignment            ├─ View Submissions
   │  (PUT /{id}/submit)           │  (GET /admin/submitted)
   │                               │
   ├─ View Submitted (pending)    ├─ Grade Assignment
   │  (GET /student/submitted)     │  (PUT /{id}/grade)
   │                               │
   └─ View Graded Results         ├─ Update Grades
      (GET /student/graded)        │  (PUT /{id}/update-grade)
                                    │
                                    └─ Delete Assignment
                                       (DELETE /{id})
```

---

## 📁 File Structure

```
Backend Files Created:
├── src/
│   ├── models/
│   │   ├── Assignment.js                    ← NEW
│   │   └── StudentAssignment.js             ← NEW
│   ├── controllers/
│   │   └── assignmentController.js          ← NEW
│   └── routes/
│       └── assignmentRoutes.js              ← NEW
├── server.js                                (UPDATED - added route)

Documentation:
├── README_ASSIGNMENTS.md                    ← System overview
├── ASSIGNMENT_INTEGRATION_GUIDE.md          ← Frontend integration
├── API_TESTING_EXAMPLES.md                  ← API examples
├── REACT_INTEGRATION_CODE.md                ← React code snippets
├── IMPLEMENTATION_CHECKLIST.md              ← Task checklist
└── QUICK_REFERENCE.md                       ← This file
```

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| **GET** | `/student/pending` | Student | Get pending assignments |
| **GET** | `/student/submitted` | Student | Get submitted assignments |
| **GET** | `/student/graded` | Student | Get graded assignments |
| **PUT** | `/{id}/submit` | Student | Submit assignment |
| **POST** | `/` | Admin | Create assignment |
| **GET** | `/admin/submitted` | Admin | Get all submissions |
| **GET** | `/admin/graded` | Admin | Get all graded |
| **PUT** | `/{id}/grade` | Admin | Grade assignment |
| **PUT** | `/{id}/update-grade` | Admin | Update grade |
| **DELETE** | `/{id}` | Admin | Delete assignment |

---

## 🚀 Getting Started

### 1. Backend
```bash
# Start server
npm run dev

# Verify running
curl http://localhost:5000
# Should return: "LMS API is running..."
```

### 2. Frontend Setup
```bash
# Create .env.local
echo "REACT_APP_API_URL=http://localhost:5000" > .env.local

# Start React
npm start
```

### 3. First Test
```bash
# Get token by logging in (use your auth endpoint)
# Then test:
curl -X GET http://localhost:5000/api/assignments/student/pending \
  -H "Authorization: Bearer your_token"
```

---

## 📊 Data Models Quick Reference

### Assignment (Created by Admin)
```javascript
{
  _id: ObjectId,
  title: String,              // "Data Structures Lab 3"
  description: String,        // "Complete lab exercises..."
  courseId: ObjectId,         // Link to course
  createdBy: ObjectId,        // Link to instructor
  dueDate: Date,              // "2026-01-25T21:30:00Z"
  maxScore: Number,           // 100
  isActive: Boolean,          // true
  createdAt: Date,            // Auto
  updatedAt: Date             // Auto
}
```

### StudentAssignment (One per Student per Assignment)
```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId,     // Link to Assignment
  studentId: ObjectId,        // Link to Student
  status: String,             // "pending" | "submitted" | "graded"
  submissionLink: String,     // "https://drive.google.com/..."
  submittedDate: Date,        // When student submitted
  score: Number,              // 0-100
  gradedDate: Date,           // When instructor graded
  gradedBy: ObjectId,         // Link to instructor who graded
  feedback: String,           // Optional feedback
  createdAt: Date,            // Auto
  updatedAt: Date             // Auto
}
```

---

## 🔄 Status Flow

```
PENDING (Student hasn't submitted yet)
    ↓
    PUT /{id}/submit (Student pastes link)
    ↓
SUBMITTED (Waiting for grade)
    ↓
    PUT /{id}/grade (Admin enters score)
    ↓
GRADED (Final state, shows score)
    ↓ (Optional)
    PUT /{id}/update-grade (Admin can edit)
    ↓
GRADED (Updated)
```

---

## 💻 Common Code Patterns

### Get Assignments (React)
```javascript
const [assignments, setAssignments] = useState([]);

useEffect(() => {
  fetch('/api/assignments/student/pending', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setAssignments(data.assignments))
    .catch(err => console.error(err));
}, [token]);
```

### Submit Assignment (React)
```javascript
const handleSubmit = async (assignmentId, link) => {
  const response = await fetch(
    `/api/assignments/${assignmentId}/submit`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ submissionLink: link })
    }
  );
  
  if (response.ok) {
    // Remove from pending, refresh submitted
    console.log('Success!');
  }
};
```

### Grade Assignment (React)
```javascript
const handleGrade = async (studentAssignmentId, score) => {
  const response = await fetch(
    `/api/assignments/${studentAssignmentId}/grade`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ score: parseInt(score) })
    }
  );
  
  if (response.ok) {
    // Remove from submitted, refresh graded
    console.log('Graded!');
  }
};
```

---

## 🔐 Security Notes

✅ **Implemented:**
- JWT token validation on all endpoints
- Role-based access (student vs admin)
- Ownership validation (student can only submit own)
- Input validation (score 0-100, link required)
- Status validation (prevent invalid transitions)

⚠️ **Remember:**
- Always include token in Authorization header
- Token format: `Bearer {token}`
- Never expose tokens in frontend code
- Use HTTPS in production
- Regenerate tokens periodically

---

## 🐛 Debugging Tips

### Check Token
```javascript
console.log('Token:', localStorage.getItem('token'));
// Should output: Bearer eyJhbGciOiJIUzI1NiI...
```

### Network Tab (Chrome DevTools)
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (e.g., submit assignment)
4. Click on API call
5. Check:
   - Request headers (Authorization present?)
   - Request body (correct format?)
   - Response status (200, 400, 401?)
   - Response body (error message?)

### Server Logs
```bash
# Watch server logs while making requests
npm run dev

# Look for:
# - "Assignment submitted successfully" ✅
# - "Token is invalid" ❌
# - "Not authorized" ❌
```

---

## 📱 Response Format Examples

### Success Response (201 Created)
```json
{
  "message": "Assignment created successfully",
  "assignment": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Data Structures Lab 3",
    ...
  }
}
```

### List Response (200 OK)
```json
{
  "count": 3,
  "assignments": [
    { "id": "...", "title": "...", ... },
    { "id": "...", "title": "...", ... }
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Score must be a number between 0 and 100"
}
```

---

## 🧪 Testing Checklist (Quick)

### Student Flow
- [ ] Can see pending assignments ✓
- [ ] Can paste link and submit ✓
- [ ] Assignment moves to submitted ✓
- [ ] Can see graded assignments ✓

### Admin Flow
- [ ] Can create assignment ✓
- [ ] Can see submitted assignments ✓
- [ ] Can enter score and save ✓
- [ ] Can edit saved score ✓

### Error Handling
- [ ] Empty link shows error ✓
- [ ] Invalid score shows error ✓
- [ ] Expired token shows error ✓

---

## 📞 Endpoint Quick Calls

### With `curl`
```bash
# Get pending
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/assignments/student/pending

# Submit
curl -X PUT http://localhost:5000/api/assignments/ID/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"submissionLink":"https://example.com"}'

# Grade
curl -X PUT http://localhost:5000/api/assignments/ID/grade \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score":85}'
```

### With JavaScript Fetch
```javascript
// GET
fetch('/api/assignments/student/pending', {
  headers: { Authorization: `Bearer ${token}` }
})

// PUT
fetch('/api/assignments/ID/submit', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ submissionLink: 'https://...' })
})
```

---

## 🎯 What Each File Does

| File | Purpose |
|------|---------|
| `Assignment.js` | Stores assignment metadata |
| `StudentAssignment.js` | Tracks student progress on each assignment |
| `assignmentController.js` | Business logic for all operations |
| `assignmentRoutes.js` | API endpoint definitions |
| `server.js` | Main app file (updated to include routes) |

---

## 🚨 Most Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot GET /api/assignments" | Routes not registered | Check server.js imports |
| "Token is not valid" | Invalid/expired JWT | Login again to get new token |
| "Not authorized" | Wrong role | Use admin account for admin endpoints |
| "Score must be a number" | Score sent as string | Convert to number: `parseInt(score)` |
| "CORS error" | Frontend URL not allowed | Add to allowedOrigins in server.js |

---

## 🎓 Learning Resources

1. **RESTful API Design**
   - Endpoint naming conventions
   - HTTP status codes
   - Request/response structure

2. **MongoDB**
   - Document structure
   - Indexes and queries
   - Relationships between collections

3. **Express.js**
   - Middleware
   - Route handlers
   - Error handling

4. **React Hooks**
   - useState
   - useEffect
   - useCallback
   - Custom hooks

---

## 📈 Next Level Features (Future)

- [ ] Pagination for large datasets
- [ ] Full-text search on assignments
- [ ] Assignment categories/tags
- [ ] Late submission handling
- [ ] Bulk grading operations
- [ ] Grade statistics/analytics
- [ ] Export to CSV
- [ ] File upload (instead of links)
- [ ] Email notifications
- [ ] Assignment templates
- [ ] Rubric-based grading

---

## 🎉 You're All Set!

**Backend:** ✅ Complete
**Documentation:** ✅ Complete
**Ready for Frontend Integration:** ✅ YES

**Next Step:** Follow ASSIGNMENT_INTEGRATION_GUIDE.md to integrate with React

---

**Version:** 1.0.0
**Last Updated:** January 24, 2026
**Status:** Production Ready ✅
