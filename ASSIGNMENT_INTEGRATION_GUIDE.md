# ASSIGNMENT SYSTEM - FRONTEND INTEGRATION GUIDE

## Backend Overview

The assignment system is now fully implemented with the following features:

### Models

**1. Assignment Model**
- `title`: Assignment title
- `description`: Assignment description
- `courseId`: Reference to the course
- `createdBy`: Reference to instructor/admin who created it
- `dueDate`: Assignment due date
- `maxScore`: Maximum possible score (default: 100)
- `isActive`: Whether assignment is active or archived
- `timestamps`: createdAt and updatedAt

**2. StudentAssignment Model**
- `assignmentId`: Reference to the assignment
- `studentId`: Reference to the student
- `status`: 'pending' | 'submitted' | 'graded'
- `submissionLink`: Link to submitted work
- `submittedDate`: When student submitted
- `score`: Score given by instructor (0-100)
- `gradedDate`: When instructor graded
- `gradedBy`: Reference to instructor who graded
- `feedback`: Optional feedback/comments
- `timestamps`: createdAt and updatedAt

---

## API ENDPOINTS

### STUDENT ENDPOINTS

#### 1. Get Pending Assignments
```
GET /api/assignments/student/pending
Headers: Authorization: Bearer {token}

Response:
{
  "count": 3,
  "assignments": [
    {
      "id": "objectId",
      "assignmentId": "objectId",
      "title": "Data Structures Lab 3",
      "description": "Complete lab exercises...",
      "courseName": "Data Structures",
      "dueDate": "2026-01-25T21:30:00.000Z"
    }
  ]
}
```

#### 2. Get Submitted Assignments
```
GET /api/assignments/student/submitted
Headers: Authorization: Bearer {token}

Response:
{
  "count": 2,
  "assignments": [
    {
      "id": "objectId",
      "assignmentId": "objectId",
      "title": "Programming Fundamentals Quiz",
      "description": "...",
      "courseName": "Programming",
      "dueDate": "2026-01-20T00:00:00.000Z",
      "submittedDate": "2026-01-19T10:30:00.000Z",
      "submissionLink": "https://drive.google.com/file/abc123",
      "status": "Pending"
    }
  ]
}
```

#### 3. Get Graded Assignments
```
GET /api/assignments/student/graded
Headers: Authorization: Bearer {token}

Response:
{
  "count": 2,
  "assignments": [
    {
      "id": "objectId",
      "assignmentId": "objectId",
      "title": "Introduction to Python",
      "description": "...",
      "courseName": "Python Basics",
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

#### 4. Submit an Assignment
```
PUT /api/assignments/{studentAssignmentId}/submit
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "submissionLink": "https://drive.google.com/file/abc123"
}

Response:
{
  "message": "Assignment submitted successfully",
  "assignment": {
    "_id": "objectId",
    "assignmentId": "objectId",
    "studentId": "objectId",
    "status": "submitted",
    "submissionLink": "https://drive.google.com/file/abc123",
    "submittedDate": "2026-01-19T10:30:00.000Z",
    ...
  }
}
```

---

### ADMIN ENDPOINTS

#### 1. Create Assignment
```
POST /api/assignments
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "Data Structures Lab 3",
  "description": "Complete the following lab exercises",
  "courseId": "objectId",
  "dueDate": "2026-01-25T21:30:00Z",
  "maxScore": 100
}

Response:
{
  "message": "Assignment created successfully",
  "assignment": {
    "_id": "objectId",
    "title": "Data Structures Lab 3",
    "description": "Complete the following lab exercises",
    "courseId": "objectId",
    "createdBy": "objectId",
    "dueDate": "2026-01-25T21:30:00.000Z",
    "maxScore": 100,
    "isActive": true,
    "createdAt": "2026-01-24T10:00:00.000Z",
    "updatedAt": "2026-01-24T10:00:00.000Z"
  }
}
```

#### 2. Get All Submitted Assignments
```
GET /api/assignments/admin/submitted
Headers: Authorization: Bearer {token}

Response:
{
  "count": 5,
  "assignments": [
    {
      "id": "objectId",
      "assignmentId": "objectId",
      "title": "Programming Fundamentals Quiz",
      "description": "...",
      "courseName": "Programming",
      "dueDate": "2026-01-20T00:00:00.000Z",
      "submittedDate": "2026-01-19T10:30:00.000Z",
      "submissionLink": "https://github.com/student/code",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "studentId": "objectId",
      "maxScore": 100
    }
  ]
}
```

#### 3. Get All Graded Assignments
```
GET /api/assignments/admin/graded
Headers: Authorization: Bearer {token}

Response:
{
  "count": 10,
  "assignments": [
    {
      "id": "objectId",
      "assignmentId": "objectId",
      "title": "Introduction to Python",
      "description": "...",
      "courseName": "Python Basics",
      "dueDate": "2026-01-10T00:00:00.000Z",
      "submittedDate": "2026-01-09T15:20:00.000Z",
      "submissionLink": "https://github.com/student/python",
      "score": "95%",
      "studentName": "Mike Johnson",
      "studentEmail": "mike@example.com",
      "studentId": "objectId",
      "gradedBy": "Sarah Admin",
      "gradedDate": "2026-01-19T11:00:00.000Z",
      "feedback": "Great job!",
      "maxScore": 100
    }
  ]
}
```

#### 4. Grade/Save Score for Submitted Assignment
```
PUT /api/assignments/{studentAssignmentId}/grade
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "score": 85,
  "feedback": "Good work, but could improve documentation"
}

Response:
{
  "message": "Assignment graded successfully",
  "assignment": {
    "_id": "objectId",
    "assignmentId": "objectId",
    "studentId": "objectId",
    "status": "graded",
    "submissionLink": "https://github.com/student/code",
    "submittedDate": "2026-01-19T10:30:00.000Z",
    "score": 85,
    "gradedDate": "2026-01-20T14:00:00.000Z",
    "gradedBy": "objectId",
    "feedback": "Good work, but could improve documentation",
    ...
  }
}
```

#### 5. Update Grade for Graded Assignment
```
PUT /api/assignments/{studentAssignmentId}/update-grade
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "score": 90,
  "feedback": "Updated: Excellent work overall"
}

Response:
{
  "message": "Grade updated successfully",
  "assignment": { ... }
}
```

#### 6. Delete Assignment
```
DELETE /api/assignments/{assignmentId}
Headers: Authorization: Bearer {token}

Response:
{
  "message": "Assignment deleted successfully"
}
```

---

## FRONTEND INTEGRATION STEPS

### 1. Update State Management

Replace your static `useState` arrays with API calls:

```javascript
// Create a custom hook for assignments
const useAssignments = () => {
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [graded, setGraded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assignments/student/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPending(data.assignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSubmittedAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assignments/student/submitted', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSubmitted(data.assignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchGradedAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assignments/student/graded', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setGraded(data.assignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    pending,
    submitted,
    graded,
    loading,
    error,
    fetchPendingAssignments,
    fetchSubmittedAssignments,
    fetchGradedAssignments
  };
};
```

### 2. Update useEffect to Fetch Data

```javascript
useEffect(() => {
  if (!isAdmin) {
    fetchPendingAssignments();
    fetchSubmittedAssignments();
    fetchGradedAssignments();
  } else {
    fetchSubmittedAssignmentsAdmin();
    fetchGradedAssignmentsAdmin();
  }
}, [isAdmin]);
```

### 3. Update Submit Button Handler

```javascript
const handleSubmitAssignment = async (studentAssignmentId, submissionLink) => {
  if (!submissionLink.trim()) {
    alert('Please paste a valid assignment link');
    return;
  }

  try {
    const response = await fetch(
      `/api/assignments/${studentAssignmentId}/submit`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ submissionLink })
      }
    );

    if (response.ok) {
      // Remove from pending
      setPending(prev => prev.filter(a => a.id !== studentAssignmentId));
      // Refresh submitted
      await fetchSubmittedAssignments();
      alert('Assignment submitted successfully!');
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert(`Error submitting assignment: ${err.message}`);
  }
};
```

### 4. Update Admin Score Save Handler

```javascript
const handleSaveScore = async (studentAssignmentId, score) => {
  if (score === '' || score === null) {
    alert('Please enter a score');
    return;
  }

  try {
    const response = await fetch(
      `/api/assignments/${studentAssignmentId}/grade`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          score: parseInt(score),
          feedback: '' // Add feedback input if needed
        })
      }
    );

    if (response.ok) {
      // Remove from submitted
      setSubmitted(prev => prev.filter(a => a.id !== studentAssignmentId));
      // Refresh graded
      await fetchGradedAssignmentsAdmin();
      setScores(prev => ({ ...prev, [studentAssignmentId]: '' }));
      alert('Assignment graded successfully!');
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert(`Error grading assignment: ${err.message}`);
  }
};
```

### 5. Update Admin Edit Score Handler

```javascript
const handleSaveEditedScore = async (studentAssignmentId) => {
  const score = scores[studentAssignmentId];

  if (score === '' || score === null) {
    alert('Please enter a score');
    return;
  }

  try {
    const response = await fetch(
      `/api/assignments/${studentAssignmentId}/update-grade`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          score: parseInt(score),
          feedback: ''
        })
      }
    );

    if (response.ok) {
      await fetchGradedAssignmentsAdmin();
      setEditingGradedId(null);
      setScores(prev => ({ ...prev, [studentAssignmentId]: '' }));
      alert('Grade updated successfully!');
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert(`Error updating grade: ${err.message}`);
  }
};
```

### 6. Update Input Field Binding

For pending section, update the input to store value in state:

```javascript
const [assignmentLinks, setAssignmentLinks] = useState({});

const handleLinkChange = (assignmentId, value) => {
  setAssignmentLinks(prev => ({ ...prev, [assignmentId]: value }));
};

// In the pending table:
<input 
  type="text" 
  placeholder="Paste your assignment link here..." 
  className="link-input first-input"
  value={assignmentLinks[item.id] || ''}
  onChange={(e) => handleLinkChange(item.id, e.target.value)}
/>
<button 
  className="submit-btn"
  onClick={() => handleSubmitAssignment(item.id, assignmentLinks[item.id])}
>
  <span><Send size={18}/></span>Submit
</button>
```

### 7. For Admin - Create Assignment Section

Add a form/modal to create assignments:

```javascript
const handleCreateAssignment = async (formData) => {
  try {
    const response = await fetch('/api/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Assignment created successfully!');
      // Refresh the lists
      await fetchSubmittedAssignmentsAdmin();
      await fetchGradedAssignmentsAdmin();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert(`Error creating assignment: ${err.message}`);
  }
};
```

---

## IMPORTANT INTEGRATION NOTES

### Token Management
- Make sure you extract the JWT token from `localStorage` or your auth context
- Include it in the `Authorization` header as `Bearer {token}`
- Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

### Error Handling
- Always wrap API calls in try-catch blocks
- Display user-friendly error messages
- Check for `response.ok` before processing

### State Synchronization
- After submitting an assignment, remove it from pending and refetch submitted
- After grading, remove from submitted and refetch graded
- Consider using a state management library (Redux/Zustand) for larger apps

### Data Transformation
- The API returns formatted data matching your frontend structure
- No additional transformation needed in most cases
- Dates are returned in ISO format (2026-01-25T21:30:00.000Z)

### Performance Optimization
- Use `useCallback` for fetch functions
- Implement pagination for large assignment lists
- Consider caching with React Query or SWR

### Security
- Always validate submission links (basic URL validation)
- Never store sensitive data in localStorage unencrypted
- Use HTTPS in production

---

## TESTING CHECKLIST

- [ ] Student can fetch and view pending assignments
- [ ] Student can submit assignment and it moves to submitted section
- [ ] Submitted section shows "Pending" status
- [ ] Admin can see submitted assignments with student details
- [ ] Admin can enter score and save
- [ ] After admin saves, assignment moves to graded section
- [ ] Student can see graded assignment with score
- [ ] Admin can edit score for graded assignment
- [ ] All dates display correctly
- [ ] Error messages display properly
- [ ] Loading states work correctly

---

## NOTES FOR DATABASE

If you haven't set up MongoDB collections yet, run these in MongoDB Compass or your MongoDB client:

```javascript
// Create Assignment collection
db.createCollection("assignments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "courseId", "createdBy", "dueDate"],
      properties: {
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        courseId: { bsonType: "objectId" },
        createdBy: { bsonType: "objectId" },
        dueDate: { bsonType: "date" },
        maxScore: { bsonType: "int" },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

// Create StudentAssignment collection
db.createCollection("studentassignments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["assignmentId", "studentId", "status"],
      properties: {
        assignmentId: { bsonType: "objectId" },
        studentId: { bsonType: "objectId" },
        status: { enum: ["pending", "submitted", "graded"] },
        submissionLink: { bsonType: ["string", "null"] },
        submittedDate: { bsonType: ["date", "null"] },
        score: { bsonType: ["int", "null"] },
        gradedDate: { bsonType: ["date", "null"] },
        gradedBy: { bsonType: ["objectId", "null"] },
        feedback: { bsonType: ["string", "null"] }
      }
    }
  }
});

// Create indexes for better query performance
db.assignments.createIndex({ courseId: 1 });
db.assignments.createIndex({ createdBy: 1 });
db.assignments.createIndex({ dueDate: 1 });

db.studentassignments.createIndex({ assignmentId: 1, studentId: 1 }, { unique: true });
db.studentassignments.createIndex({ studentId: 1, status: 1 });
db.studentassignments.createIndex({ assignmentId: 1, status: 1 });
```

---

## NEXT STEPS

1. Install any missing dependencies (should be fine with current setup)
2. Test all endpoints using Postman or Insomnia
3. Implement the frontend integration following the steps above
4. Test the complete flow: Create → Submit → Grade
5. Add more admin features like bulk grading, assignment categories, etc.

Good luck with the integration! 🚀
