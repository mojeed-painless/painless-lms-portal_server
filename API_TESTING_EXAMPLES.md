# ASSIGNMENT API - QUICK REFERENCE & TESTING EXAMPLES

## Base URL
```
http://localhost:5000/api/assignments
```

## Authentication
All endpoints (except for public ones) require a Bearer token in the header:
```
Authorization: Bearer {your_jwt_token}
```

---

## STUDENT API EXAMPLES

### 1. Get Pending Assignments
**Endpoint:** `GET /student/pending`

**Command (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments/student/pending \
  -H "Authorization: Bearer your_token_here"
```

**Response (Success 200):**
```json
{
  "count": 3,
  "assignments": [
    {
      "id": "507f1f77bcf86cd799439011",
      "assignmentId": "507f1f77bcf86cd799439012",
      "title": "Data Structures Lab 3",
      "description": "Complete lab exercises on trees and graphs",
      "courseName": "Data Structures",
      "dueDate": "2026-01-25T21:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Submitted Assignments
**Endpoint:** `GET /student/submitted`

**Command (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments/student/submitted \
  -H "Authorization: Bearer your_token_here"
```

**Response (Success 200):**
```json
{
  "count": 2,
  "assignments": [
    {
      "id": "507f1f77bcf86cd799439015",
      "assignmentId": "507f1f77bcf86cd799439016",
      "title": "Programming Fundamentals Quiz",
      "description": "Quiz on basic programming concepts",
      "courseName": "Programming Basics",
      "dueDate": "2026-01-20T00:00:00.000Z",
      "submittedDate": "2026-01-19T10:30:00.000Z",
      "submissionLink": "https://drive.google.com/file/abc123",
      "status": "Pending"
    }
  ]
}
```

---

### 3. Get Graded Assignments
**Endpoint:** `GET /student/graded`

**Command (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments/student/graded \
  -H "Authorization: Bearer your_token_here"
```

**Response (Success 200):**
```json
{
  "count": 2,
  "assignments": [
    {
      "id": "507f1f77bcf86cd799439020",
      "assignmentId": "507f1f77bcf86cd799439021",
      "title": "Introduction to Python",
      "description": "Learn Python basics",
      "courseName": "Python Fundamentals",
      "dueDate": "2026-01-10T00:00:00.000Z",
      "submittedDate": "2026-01-09T15:20:00.000Z",
      "submissionLink": "https://github.com/student/python-intro",
      "score": "95%",
      "gradedDate": "2026-01-19T11:00:00.000Z",
      "feedback": "Excellent work! Well documented code."
    }
  ]
}
```

---

### 4. Submit an Assignment
**Endpoint:** `PUT /{studentAssignmentId}/submit`

**Command (cURL):**
```bash
curl -X PUT http://localhost:5000/api/assignments/507f1f77bcf86cd799439011/submit \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionLink": "https://drive.google.com/file/student_submission_123"
  }'
```

**Request Body:**
```json
{
  "submissionLink": "https://drive.google.com/file/student_submission_123"
}
```

**Response (Success 200):**
```json
{
  "message": "Assignment submitted successfully",
  "assignment": {
    "_id": "507f1f77bcf86cd799439011",
    "assignmentId": "507f1f77bcf86cd799439012",
    "studentId": "507f1f77bcf86cd799439001",
    "status": "submitted",
    "submissionLink": "https://drive.google.com/file/student_submission_123",
    "submittedDate": "2026-01-19T10:30:00.000Z",
    "score": null,
    "gradedDate": null,
    "gradedBy": null,
    "feedback": null,
    "createdAt": "2026-01-18T08:00:00.000Z",
    "updatedAt": "2026-01-19T10:30:00.000Z"
  }
}
```

**Error Response (400 - Missing Link):**
```json
{
  "message": "Submission link is required"
}
```

**Error Response (403 - Unauthorized):**
```json
{
  "message": "Not authorized to submit this assignment"
}
```

---

## ADMIN API EXAMPLES

### 1. Create Assignment
**Endpoint:** `POST /`

**Command (cURL):**
```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Structures Lab 3",
    "description": "Complete the following lab exercises on trees and graphs",
    "courseId": "507f1f77bcf86cd799439005",
    "dueDate": "2026-01-25T21:30:00Z",
    "maxScore": 100
  }'
```

**Request Body:**
```json
{
  "title": "Data Structures Lab 3",
  "description": "Complete the following lab exercises on trees and graphs",
  "courseId": "507f1f77bcf86cd799439005",
  "dueDate": "2026-01-25T21:30:00Z",
  "maxScore": 100
}
```

**Response (Success 201):**
```json
{
  "message": "Assignment created successfully",
  "assignment": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Data Structures Lab 3",
    "description": "Complete the following lab exercises on trees and graphs",
    "courseId": "507f1f77bcf86cd799439005",
    "createdBy": "507f1f77bcf86cd799439002",
    "dueDate": "2026-01-25T21:30:00.000Z",
    "maxScore": 100,
    "isActive": true,
    "createdAt": "2026-01-24T10:00:00.000Z",
    "updatedAt": "2026-01-24T10:00:00.000Z"
  }
}
```

---

### 2. Get All Submitted Assignments (Admin)
**Endpoint:** `GET /admin/submitted`

**Command (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments/admin/submitted \
  -H "Authorization: Bearer admin_token_here"
```

**Response (Success 200):**
```json
{
  "count": 5,
  "assignments": [
    {
      "id": "507f1f77bcf86cd799439011",
      "assignmentId": "507f1f77bcf86cd799439012",
      "title": "Programming Fundamentals Quiz",
      "description": "Quiz on basic programming concepts",
      "courseName": "Programming Basics",
      "dueDate": "2026-01-20T00:00:00.000Z",
      "submittedDate": "2026-01-19T10:30:00.000Z",
      "submissionLink": "https://github.com/student/code",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "studentId": "507f1f77bcf86cd799439001",
      "maxScore": 100
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "assignmentId": "507f1f77bcf86cd799439012",
      "title": "Programming Fundamentals Quiz",
      "description": "Quiz on basic programming concepts",
      "courseName": "Programming Basics",
      "dueDate": "2026-01-20T00:00:00.000Z",
      "submittedDate": "2026-01-19T14:15:00.000Z",
      "submissionLink": "https://github.com/student2/code",
      "studentName": "Jane Smith",
      "studentEmail": "jane@example.com",
      "studentId": "507f1f77bcf86cd799439003",
      "maxScore": 100
    }
  ]
}
```

---

### 3. Get All Graded Assignments (Admin)
**Endpoint:** `GET /admin/graded`

**Command (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments/admin/graded \
  -H "Authorization: Bearer admin_token_here"
```

**Response (Success 200):**
```json
{
  "count": 10,
  "assignments": [
    {
      "id": "507f1f77bcf86cd799439020",
      "assignmentId": "507f1f77bcf86cd799439021",
      "title": "Introduction to Python",
      "description": "Learn Python basics",
      "courseName": "Python Fundamentals",
      "dueDate": "2026-01-10T00:00:00.000Z",
      "submittedDate": "2026-01-09T15:20:00.000Z",
      "submissionLink": "https://github.com/student/python-intro",
      "score": "95%",
      "studentName": "Mike Johnson",
      "studentEmail": "mike@example.com",
      "studentId": "507f1f77bcf86cd799439007",
      "gradedBy": "Sarah Admin",
      "gradedDate": "2026-01-19T11:00:00.000Z",
      "feedback": "Excellent work! Well documented code.",
      "maxScore": 100
    }
  ]
}
```

---

### 4. Grade a Submitted Assignment
**Endpoint:** `PUT /{studentAssignmentId}/grade`

**Command (cURL):**
```bash
curl -X PUT http://localhost:5000/api/assignments/507f1f77bcf86cd799439011/grade \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "feedback": "Good work, but could improve documentation"
  }'
```

**Request Body:**
```json
{
  "score": 85,
  "feedback": "Good work, but could improve documentation"
}
```

**Response (Success 200):**
```json
{
  "message": "Assignment graded successfully",
  "assignment": {
    "_id": "507f1f77bcf86cd799439011",
    "assignmentId": "507f1f77bcf86cd799439012",
    "studentId": "507f1f77bcf86cd799439001",
    "status": "graded",
    "submissionLink": "https://github.com/student/code",
    "submittedDate": "2026-01-19T10:30:00.000Z",
    "score": 85,
    "gradedDate": "2026-01-20T14:00:00.000Z",
    "gradedBy": "507f1f77bcf86cd799439002",
    "feedback": "Good work, but could improve documentation",
    "createdAt": "2026-01-18T08:00:00.000Z",
    "updatedAt": "2026-01-20T14:00:00.000Z"
  }
}
```

**Error Response (400 - Invalid Score):**
```json
{
  "message": "Score must be a number between 0 and 100"
}
```

---

### 5. Update Grade for Graded Assignment
**Endpoint:** `PUT /{studentAssignmentId}/update-grade`

**Command (cURL):**
```bash
curl -X PUT http://localhost:5000/api/assignments/507f1f77bcf86cd799439011/update-grade \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 90,
    "feedback": "Updated: Excellent work overall"
  }'
```

**Request Body:**
```json
{
  "score": 90,
  "feedback": "Updated: Excellent work overall"
}
```

**Response (Success 200):**
```json
{
  "message": "Grade updated successfully",
  "assignment": {
    "_id": "507f1f77bcf86cd799439011",
    "assignmentId": "507f1f77bcf86cd799439012",
    "studentId": "507f1f77bcf86cd799439001",
    "status": "graded",
    "submissionLink": "https://github.com/student/code",
    "submittedDate": "2026-01-19T10:30:00.000Z",
    "score": 90,
    "gradedDate": "2026-01-20T14:00:00.000Z",
    "gradedBy": "507f1f77bcf86cd799439002",
    "feedback": "Updated: Excellent work overall",
    "createdAt": "2026-01-18T08:00:00.000Z",
    "updatedAt": "2026-01-20T15:30:00.000Z"
  }
}
```

---

### 6. Delete Assignment
**Endpoint:** `DELETE /{assignmentId}`

**Command (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/assignments/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer admin_token_here"
```

**Response (Success 200):**
```json
{
  "message": "Assignment deleted successfully"
}
```

**Error Response (404 - Not Found):**
```json
{
  "message": "Assignment not found"
}
```

---

## ERROR CODES & MESSAGES

| Code | Scenario | Message |
|------|----------|---------|
| 400 | Missing required field | "Please provide title, courseId, and dueDate" |
| 400 | Invalid submission link | "Submission link is required" |
| 400 | Invalid score | "Score must be a number between 0 and 100" |
| 400 | Already submitted | "This assignment has already been submitted or graded" |
| 400 | Not submitted yet | "Assignment has not been submitted yet" |
| 403 | Not authorized | "Not authorized to submit this assignment" |
| 403 | Not admin | "Not authorized to delete this assignment" |
| 404 | Not found | "Assignment not found" |

---

## TESTING FLOW

### Complete Student Flow
1. **Get pending assignments** → See all unsubmitted assignments
2. **Submit assignment** → Student uploads link
3. **Get submitted assignments** → Verify it moved from pending
4. **Admin grades it** → Score is added
5. **Get graded assignments** → Student sees score and feedback

### Complete Admin Flow
1. **Create assignment** → Add new task for students
2. **Get submitted assignments** → See all student submissions
3. **Grade assignment** → Add score for a student
4. **Get graded assignments** → Verify grade was saved
5. **Update grade** → Edit a previously graded assignment (if needed)

---

## NOTES FOR TESTING WITH POSTMAN

1. Create a **Postman environment** with variables:
   - `base_url`: http://localhost:5000/api/assignments
   - `student_token`: Your student JWT token
   - `admin_token`: Your admin JWT token
   - `courseId`: Valid course ID from your database
   - `assignmentId`: Valid assignment ID
   - `studentAssignmentId`: Valid student assignment ID

2. Use these variables in your requests like `{{base_url}}`, `{{student_token}}`, etc.

3. Set up **pre-request scripts** to automatically refresh expired tokens

4. Use **Postman tests** to verify response status codes and data structure

---

## NEXT STEPS FOR FRONTEND

1. Test these endpoints using Postman first
2. Implement the API integration in your React component
3. Handle loading and error states
4. Add success/error notifications
5. Implement pagination for large datasets
6. Add data validation before sending to API

Happy testing! 🎉
