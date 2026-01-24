# Backend API Testing - Diagnostic Guide

## Quick Test Commands

### 1. Check if Backend is Running
```bash
curl http://localhost:5000/
```

Expected response:
```
LMS API is running...
```

---

### 2. Test Assignment Endpoints

#### A. Create Assignment (requires admin token)
```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Build a Todo App",
    "description": "Create a responsive todo app",
    "courseId": "react",
    "dueDate": "2024-12-31",
    "maxScore": 100
  }'
```

#### B. Get All Assignments (admin only)
```bash
curl -X GET http://localhost:5000/api/assignments/admin/all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### C. Update Assignment
```bash
curl -X PUT http://localhost:5000/api/assignments/ASSIGNMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Updated Title",
    "dueDate": "2024-12-25"
  }'
```

#### D. Delete Assignment
```bash
curl -X DELETE http://localhost:5000/api/assignments/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Using Postman Instead

### Setup:
1. Open Postman
2. Create new collection called "Assignment API"
3. Set base URL: `http://localhost:5000`
4. Set environment variable: `{{token}}` to your admin JWT token

### Test Requests:

**Create Assignment:**
- Method: POST
- URL: `/api/assignments`
- Headers: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "title": "Build a Todo App",
  "description": "Create a responsive todo application",
  "courseId": "react",
  "dueDate": "2024-12-31",
  "maxScore": 100
}
```

**Get All Assignments:**
- Method: GET
- URL: `/api/assignments/admin/all`
- Headers:
  - `Authorization: Bearer {{token}}`

**Update Assignment:**
- Method: PUT
- URL: `/api/assignments/ASSIGNMENT_ID`
- Headers:
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2024-12-25"
}
```

**Delete Assignment:**
- Method: DELETE
- URL: `/api/assignments/ASSIGNMENT_ID`
- Headers:
  - `Authorization: Bearer {{token}}`

---

## Troubleshooting

### Error: 404 Not Found
**Cause:** Backend server not running or route not registered
**Fix:** 
1. Check if `npm start` is running
2. Verify port 5000 is not in use
3. Check routes are registered in `server.js`

### Error: 401 Unauthorized
**Cause:** Missing or invalid JWT token
**Fix:**
1. Login first to get token
2. Verify token is valid and not expired
3. Include `Authorization: Bearer TOKEN` header

### Error: 403 Forbidden
**Cause:** User is not admin
**Fix:**
1. Use admin account token
2. Verify user role is 'admin' in database

### Error: Request Body Empty
**Cause:** Missing Content-Type header
**Fix:**
1. Include `Content-Type: application/json` header
2. Ensure body is valid JSON

---

## Database Verification

### Check Assignments Collection
```javascript
// In MongoDB
db.assignments.find().pretty()

// Should return:
{
  _id: ObjectId("..."),
  title: "Build a Todo App",
  description: "Create a responsive...",
  courseId: "react",
  createdBy: ObjectId("admin_id"),
  dueDate: ISODate("2024-12-31T00:00:00.000Z"),
  maxScore: 100,
  isActive: true,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Check StudentAssignments Collection
```javascript
// In MongoDB
db.studentassignments.find({ status: "pending" }).pretty()

// Should return:
{
  _id: ObjectId("..."),
  assignmentId: ObjectId("..."),
  studentId: ObjectId("..."),
  status: "pending",
  submissionLink: null,
  score: null,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## Testing Workflow

### Step 1: Verify Backend is Running
```bash
# In terminal, run:
npm start

# You should see:
# Server running in development mode on port 5000
# Connected to MongoDB
```

### Step 2: Get Admin Token
1. Login via frontend or API as admin
2. Copy the JWT token from response
3. Save to Postman environment variable

### Step 3: Test Create Endpoint
```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","courseId":"html","dueDate":"2024-12-31"}'
```

### Step 4: Test Get Endpoint
```bash
curl http://localhost:5000/api/assignments/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Test Update Endpoint
```bash
# Get assignment ID from previous response
curl -X PUT http://localhost:5000/api/assignments/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

### Step 6: Test Delete Endpoint
```bash
curl -X DELETE http://localhost:5000/api/assignments/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Console Debugging

### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Make API call from frontend
4. Click on the request
5. Check:
   - Request URL
   - Request Headers (Authorization)
   - Request Body
   - Response Status (should be 200-201)
   - Response Body (should contain data)

### Check Console:
1. Look for error messages
2. Check for stack traces
3. Search for "404" or "500" errors

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | Route not registered | Check server.js imports |
| 401 Unauthorized | Missing token | Add Authorization header |
| 403 Forbidden | Not admin user | Use admin account |
| 500 Internal Error | Database connection | Check MongoDB running |
| Request body empty | Missing Content-Type | Add JSON header |

---

## Environment Variables Needed

```bash
# .env file should contain:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## Success Indicators

✅ Backend starts without errors
✅ GET http://localhost:5000 returns "LMS API is running..."
✅ POST /api/assignments returns 201 Created
✅ GET /api/assignments/admin/all returns 200 OK
✅ PUT /api/assignments/:id returns 200 OK
✅ DELETE /api/assignments/:id returns 200 OK
✅ Assignments appear in MongoDB
✅ StudentAssignments created for all students

---

## Next Steps

1. **Verify backend is working** - Follow testing workflow above
2. **Check frontend is calling correct URLs** - Verify API_URL in .env
3. **Verify authentication** - Check token is valid
4. **Test all CRUD operations** - Create, read, update, delete
5. **Check database** - Verify data is persisted
6. **Test frontend** - Try creating assignment in UI

---

## Support

If you encounter issues:

1. Check this guide first
2. Verify backend is running: `curl http://localhost:5000`
3. Check error messages in console
4. Review Network tab in DevTools
5. Check database for data
6. Verify token is valid (not expired)

All 4 endpoints should be working. If you get 404, restart the backend server.

