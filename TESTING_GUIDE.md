# Admin Assignment Management - Testing & Implementation Guide

## Quick Start Checklist

### Backend Verification (5 minutes)
- [ ] Open `src/controllers/assignmentController.js`
- [ ] Verify `getCreatedAssignments` function exists (line ~370)
- [ ] Verify `updateAssignment` function exists (line ~398)
- [ ] Verify `deleteAssignment` function updated with cascade logic (line ~432)
- [ ] Check exports include all 3 new functions

### Route Setup (2 minutes)
- [ ] Open `src/routes/assignmentRoutes.js`
- [ ] Verify imports include: `getCreatedAssignments`, `updateAssignment`, `deleteAssignment`
- [ ] Verify routes exist:
  - `GET /admin/all` (line ~38)
  - `PUT /:assignmentId` (line ~43)
  - `DELETE /:assignmentId` (line ~51)

### Frontend Setup (5 minutes)
- [ ] Copy `REACT_INTEGRATION_CODE.md` hook section to `src/hooks/useAssignments.js`
- [ ] Copy CSS content from `ASSIGNMENT_STYLES.css` to `src/assets/styles/assignment.css`
- [ ] Update `src/pages/AssignmentScreen.jsx` with:
  - New imports (Plus, Trash2 icons)
  - Hook destructuring with new methods
  - New state variables for form data
  - New handler functions
  - Admin form section in JSX

---

## Testing Scenarios

### Scenario 1: Create Assignment ✅

**Setup:**
- Login as admin
- Navigate to Assignments page
- Locate "Create & Manage Assignments" section

**Steps:**
```
1. Fill in form fields:
   - Title: "Build a Todo App"
   - Description: "Create a responsive todo application using React"
   - Course Type: "React"
   - Due Date: 2024-12-31
   - Max Score: 100

2. Click "Create Assignment" button

3. Expected Results:
   - No validation errors
   - Assignment appears in table below form
   - Form fields reset to empty
   - Success message shown
```

**Expected API Call:**
```
POST /api/assignments
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Build a Todo App",
  "description": "Create a responsive todo application using React",
  "courseId": "react",
  "dueDate": "2024-12-31",
  "maxScore": 100
}

Response:
{
  "success": true,
  "assignment": {
    "_id": "assign_123",
    "title": "Build a Todo App",
    "description": "Create a responsive todo application using React",
    "courseId": "react",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "maxScore": 100,
    "createdBy": "admin_user_id",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Scenario 2: Validation - Missing Fields ❌

**Steps:**
```
1. Click "Create Assignment" without filling form

2. Expected Results:
   - Alert message: "Please fill in all required fields"
   - No API call made
   - Form remains open with empty fields
   - No assignment created
```

**Test Each Field:**
- Missing Title → Alert
- Missing Description → Alert
- Missing Course Type → Alert
- Missing Due Date → Alert
- Missing Max Score → OK (uses default 100)

### Scenario 3: View Created Assignments 📋

**Steps:**
```
1. After creating assignments, scroll to "Assignment Management" table

2. Expected Table Columns:
   - # (row number)
   - Title
   - Course Type
   - Due Date
   - Max Score
   - Created Date
   - Status
   - Actions

3. Verify all assignments display correctly
```

**Expected API Call:**
```
GET /api/assignments/admin/all
Authorization: Bearer <token>

Response:
{
  "success": true,
  "assignments": [
    {
      "_id": "assign_123",
      "title": "Build a Todo App",
      "courseId": "react",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "maxScore": 100,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isActive": true
    },
    // ... more assignments
  ]
}
```

### Scenario 4: Edit Assignment ✏️

**Setup:**
- Have at least one assignment in the table
- Click "Edit" button on an assignment row

**Steps:**
```
1. Click "Edit" button

2. Expected Results:
   - Row enters edit mode
   - Title and Due Date become editable input fields
   - Edit/Delete buttons change to Save/Cancel buttons

3. Update fields:
   - Change Title to "Build a Todo App - Advanced"
   - Change Due Date to 2024-12-25

4. Click "Save" button

5. Expected Results:
   - API call to update assignment
   - Row exits edit mode
   - Table updates with new values
   - Success message shown
```

**Expected API Call:**
```
PUT /api/assignments/assign_123
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Build a Todo App - Advanced",
  "dueDate": "2024-12-25"
}

Response:
{
  "success": true,
  "assignment": {
    "_id": "assign_123",
    "title": "Build a Todo App - Advanced",
    "dueDate": "2024-12-25T00:00:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### Scenario 5: Cancel Edit 🚫

**Setup:**
- Click "Edit" on an assignment

**Steps:**
```
1. Click "Cancel" button while in edit mode

2. Expected Results:
   - Row exits edit mode
   - Original values displayed
   - Edit/Delete buttons shown again
   - No API call made
```

### Scenario 6: Delete Assignment 🗑️

**Setup:**
- Have at least one assignment in the table
- Click "Delete" button on an assignment row

**Steps:**
```
1. Click "Delete" button

2. Expected Results:
   - Confirmation dialog appears
   - Message: "Are you sure you want to delete this assignment?
              Student submissions will be preserved."

3. Click "OK" to confirm

4. Expected Results:
   - API call to delete assignment
   - Assignment removed from table
   - Success message shown
   - Assignment list refreshes

5. Verify in database:
   - Assignment document deleted
   - StudentAssignment with pending status deleted
   - StudentAssignment with submitted/graded status preserved
```

**Expected API Call:**
```
DELETE /api/assignments/assign_123
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

### Scenario 7: Delete with Student Submissions 📚

**Setup:**
- Create assignment
- Have students submit the assignment
- Click "Delete" on the assignment

**Steps:**
```
1. Confirm deletion via dialog

2. Expected Results:
   - Assignment document deleted
   - Student submissions preserved (not deleted)
   - Student grades preserved (if any)

3. Verify:
   - Students still see submitted assignments in their view
   - Grades still visible to admin
   - Assignment no longer in admin creation list
```

### Scenario 8: Student View - Pending Assignments 📤

**Setup:**
- Login as student
- Admin has created assignments
- Student has not submitted yet

**Steps:**
```
1. Navigate to Assignments page

2. Expected Results:
   - "Pending Assignments" section visible
   - Shows all created assignments by admin
   - Each assignment shows:
     - Title
     - Due Date
     - Input field for assignment link
     - Submit button

3. Submit an assignment:
   - Paste GitHub/CodePen link
   - Click "Submit"
   - Assignment moves to "Submitted" section
```

### Scenario 9: Student View - Submitted Assignments 📝

**Steps:**
```
1. After submission, check "Submitted Assignments" section

2. Expected Results:
   - Shows submitted assignments
   - Displays:
     - Title
     - Due Date
     - Submitted Date
     - Assignment Link (read-only)
     - Status: "pending" (waiting for grading)

3. Assignment details should match original submission
```

### Scenario 10: Admin View - Grading 🎯

**Setup:**
- Students have submitted assignments
- Login as admin

**Steps:**
```
1. Navigate to Assignments page

2. Go to "Submitted Assignments" section

3. Expected Results:
   - Shows all submitted assignments
   - Displays:
     - Assignment Title
     - Student Name
     - Due Date
     - Submitted Date
     - Assignment Link
     - Score input field (empty)

4. Enter score and click "Save":
   - Enter: 85
   - Click "Save Score"

5. Expected Results:
   - Score saved
   - Assignment moves to "Graded Assignments"
   - Submission removed from "Submitted"
```

---

## Testing Checklist

### Create Assignment
- [ ] Form validation works (all fields required)
- [ ] Creates assignment successfully
- [ ] Form resets after creation
- [ ] Assignment appears in table
- [ ] Can create multiple assignments
- [ ] Course type dropdown works (html, js, react)
- [ ] Date picker works correctly

### View Assignments
- [ ] Assignment list loads on page load
- [ ] All columns display correctly
- [ ] Data formats correctly (dates, scores)
- [ ] Table is responsive on mobile
- [ ] Can scroll horizontally if needed
- [ ] Empty state message shows if no assignments

### Edit Assignment
- [ ] Click Edit enters edit mode
- [ ] Form shows current values
- [ ] Can update title
- [ ] Can update due date
- [ ] Can update other fields
- [ ] Save button works
- [ ] Cancel button reverts changes
- [ ] Validation works in edit mode

### Delete Assignment
- [ ] Click Delete shows confirmation
- [ ] Cancel confirmation cancels delete
- [ ] OK confirmation deletes assignment
- [ ] Assignment removed from table
- [ ] Student submissions preserved
- [ ] Can delete assignment without submissions

### Student Experience
- [ ] Student sees pending assignments
- [ ] Student can submit assignments
- [ ] Submitted assignments appear in submitted section
- [ ] Submitted assignments don't appear in pending
- [ ] Can see own grades in graded section
- [ ] Cannot see other students' assignments

### Admin Experience
- [ ] Admin can see submitted assignments
- [ ] Admin can enter grades
- [ ] Admin can edit grades
- [ ] Graded assignments move to graded section
- [ ] Can edit/delete own assignments
- [ ] Cannot access other admin's management area

### Styling & Responsiveness
- [ ] Form looks good on desktop
- [ ] Table displays well on desktop
- [ ] Form responsive on tablet
- [ ] Table responsive on tablet
- [ ] Form usable on mobile
- [ ] Table scrollable on mobile
- [ ] Buttons accessible on touch devices
- [ ] Colors match existing design
- [ ] Icons display correctly
- [ ] No layout breaks

### Error Handling
- [ ] Network error shows message
- [ ] Validation error shows message
- [ ] Loading state shows while fetching
- [ ] Disabled state during API calls
- [ ] Error alerts are clear and helpful
- [ ] Can retry after error

---

## Database Verification

### Check Assignment Creation
```javascript
// In MongoDB
db.assignments.findOne({ title: "Build a Todo App" })

// Should return:
{
  _id: ObjectId("..."),
  title: "Build a Todo App",
  description: "Create a responsive...",
  courseId: "react",
  createdBy: "admin_user_id",
  dueDate: ISODate("2024-12-31T00:00:00.000Z"),
  maxScore: 100,
  isActive: true,
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

### Check Student Assignment Creation
```javascript
// In MongoDB
db.studentassignments.find({ assignmentId: ObjectId("...") })

// Should return documents for each student with status: "pending"
{
  _id: ObjectId("..."),
  assignmentId: ObjectId("..."),
  studentId: "student_123",
  status: "pending",
  submissionLink: null,
  score: null,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Check Safe Deletion
```javascript
// Before delete: Check StudentAssignments
db.studentassignments.find({ assignmentId: ObjectId("...") })
// Should have documents with various statuses

// After delete assignment: Check status
db.assignments.findOne({ _id: ObjectId("...") })
// Should be null/not found

db.studentassignments.find({ assignmentId: ObjectId("...") })
// Should only have "submitted" and "graded" documents
// "pending" should be deleted
```

---

## Browser DevTools Debugging

### Check Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (e.g., create assignment)
4. Look for API call in list
5. Click request to see:
   - Request URL
   - Request Headers (Authorization)
   - Request Body (JSON)
   - Response Status (200, 400, etc.)
   - Response Body (JSON)
```

### Check Console for Errors
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Check for:
   - Network errors
   - Syntax errors
   - Console.log output (if added)
```

### Check Component State
```javascript
// Add to component for debugging
useEffect(() => {
  console.log('Created Assignments:', createdAssignments);
  console.log('Form Data:', createFormData);
  console.log('Editing ID:', editingId);
  console.log('Loading:', loading);
  console.log('Error:', error);
}, [createdAssignments, createFormData, editingId, loading, error]);
```

---

## Common Test Failures & Solutions

### ❌ "Cannot read property createdAssignments"
**Cause:** Hook not properly destructured
**Solution:** Check hook destructuring includes all new methods

### ❌ "Edit button not working"
**Cause:** handleEditStart not defined or bound
**Solution:** Check function is defined and called with correct parameters

### ❌ "Date not formatting correctly"
**Cause:** Date string manipulation issue
**Solution:** Verify date split: `assignment.dueDate.split('T')[0]`

### ❌ "Delete doesn't preserve submissions"
**Cause:** Cascade delete logic incomplete
**Solution:** Check deleteAssignment removes only pending StudentAssignments

### ❌ "Form submission disabled"
**Cause:** Loading state is true
**Solution:** Check API response/error - button enables when loading = false

### ❌ "Icons not showing"
**Cause:** lucide-react not installed
**Solution:** `npm install lucide-react`

### ❌ "Styles not applied"
**Cause:** CSS file not imported or wrong path
**Solution:** Check import path: `import '../assets/styles/assignment.css'`

---

## Performance Testing

### Test with Large Dataset
```javascript
// Create test data
for (let i = 0; i < 100; i++) {
  await createAssignment({
    title: `Assignment ${i}`,
    description: `Description ${i}`,
    courseId: 'react',
    dueDate: new Date().toISOString(),
    maxScore: 100
  });
}

// Measure:
- Time to fetch all assignments
- Time to render table
- Scroll performance
- Memory usage
```

### Optimize if Needed
```javascript
// Add pagination
const [page, setPage] = useState(1);
const pageSize = 20;

const displayedAssignments = createdAssignments.slice(
  (page - 1) * pageSize,
  page * pageSize
);

// Add search
const [search, setSearch] = useState('');
const filteredAssignments = createdAssignments.filter(a =>
  a.title.toLowerCase().includes(search.toLowerCase())
);
```

---

## Final Sign-Off

Once all tests pass:

- [ ] Create test assignment
- [ ] Edit test assignment
- [ ] Delete test assignment
- [ ] Student submits assignment
- [ ] Admin grades assignment
- [ ] All dates format correctly
- [ ] All buttons work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No network errors

**Ready for Production! ✅**

