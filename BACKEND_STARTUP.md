# 🚀 Backend Setup Checklist - Quick Start Guide

## What Was Fixed

✅ **Route Order Fixed** - POST endpoint now comes before GET routes  
✅ **All 4 Endpoints Ready** - Create, Read, Update, Delete  
✅ **Database Models** - Assignment and StudentAssignment  
✅ **Authentication** - JWT and role-based protection  

---

## 🔧 Backend Server Startup

### Step 1: Install Dependencies (if not already done)
```bash
npm install
```

### Step 2: Start Backend Server
```bash
npm start
```

**Expected Output:**
```
Server running in development mode on port 5000
Connected to MongoDB
```

### Step 3: Verify It's Running
Open browser and go to:
```
http://localhost:5000/
```

You should see:
```
LMS API is running...
```

---

## ✅ Verify All 4 Endpoints

### Using Browser DevTools Network Tab:

1. **Open DevTools** - Press F12
2. **Go to Network tab**
3. **Go to Application/Console tab** - Log in to get token
4. **Copy your admin token** - Save it
5. **Test each endpoint** below

### Quick Test in Browser Console

```javascript
// 1. Get your admin token first (login)
const token = localStorage.getItem('token');
console.log('Token:', token);

// 2. Create Assignment
fetch('http://localhost:5000/api/assignments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Assignment',
    description: 'Test Description',
    courseId: 'react',
    dueDate: '2024-12-31',
    maxScore: 100
  })
})
.then(r => r.json())
.then(d => console.log('Created:', d));

// 3. Get All Assignments
fetch('http://localhost:5000/api/assignments/admin/all', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Assignments:', d));
```

---

## 🎯 Expected Endpoints After Restart

### 1. Create Assignment ✓
```
POST /api/assignments
Status: 201 Created
```

### 2. Get All Assignments ✓
```
GET /api/assignments/admin/all
Status: 200 OK
```

### 3. Update Assignment ✓
```
PUT /api/assignments/:assignmentId
Status: 200 OK
```

### 4. Delete Assignment ✓
```
DELETE /api/assignments/:assignmentId
Status: 200 OK
```

---

## 🐛 If Still Getting 404

### Cause: Backend Not Restarted
**Fix:** 
1. Stop the backend server (Ctrl+C)
2. Run: `npm start`
3. Wait for "Server running..." message
4. Try again

### Cause: Wrong Port
**Fix:**
Check `.env` file for PORT setting:
```
PORT=5000
```

### Cause: Routes Not Imported
**Fix:**
Check `server.js` line 45-47:
```javascript
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);  // This line
```

---

## 📋 Pre-Testing Checklist

Before you test the frontend, verify:

- [ ] Backend server is running (`npm start`)
- [ ] Terminal shows "Server running on port 5000"
- [ ] Terminal shows "Connected to MongoDB"
- [ ] You can visit `http://localhost:5000/` in browser
- [ ] Browser shows "LMS API is running..."
- [ ] You have an admin account (or know the admin token)
- [ ] Frontend is running on `http://localhost:5173` (or your port)
- [ ] CORS is enabled (check server.js)

---

## 🧪 Quick Smoke Test

### Test 1: Is Backend Running?
```bash
curl http://localhost:5000/
```

Response:
```
LMS API is running...
```

### Test 2: Can Create Assignment?
```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"title":"Test","description":"Test","courseId":"html","dueDate":"2024-12-31"}'
```

Response should be:
```json
{
  "message": "Assignment created successfully",
  "assignment": { ... }
}
```

If you get **404**, your backend is not running or routes aren't registered.  
If you get **401**, your token is missing or invalid.  
If you get **403**, your user is not admin.

---

## 🎬 Next Steps

1. **Restart Backend**
   ```bash
   npm start
   ```

2. **Verify It's Running**
   ```bash
   curl http://localhost:5000/
   ```

3. **Get Admin Token**
   - Login via frontend
   - Check Network tab → Login request → See token in response

4. **Test Create Endpoint**
   - Use browser console or Postman
   - POST to `/api/assignments`
   - Include token in Authorization header

5. **Try Frontend**
   - Fill out assignment form
   - Click "Create Assignment"
   - Should see assignment in table
   - Check Network tab for successful POST

---

## 📝 Environment Setup

Make sure `.env` file has:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/lms

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🎯 Success Signs

✅ Backend starts without errors  
✅ No 404 errors in console  
✅ POST requests return 201  
✅ GET requests return 200  
✅ PUT requests return 200  
✅ DELETE requests return 200  
✅ Assignments appear in database  
✅ Frontend can create/edit/delete  

---

## 🆘 Still Not Working?

### Check Backend Logs
Look for error messages when server starts:
- Database connection errors
- Missing environment variables
- Port already in use

### Check Frontend Console
1. Press F12
2. Go to Console tab
3. Look for API error messages
4. Check Network tab → see actual API response

### Check Network Tab
1. Try creating assignment
2. Right-click the POST request
3. Click "Inspect"
4. Check:
   - Request URL
   - Request Headers (Authorization)
   - Response Status (should be 201)
   - Response Body (should show created assignment)

### Restart Everything
```bash
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Start backend
npm start

# In new terminal, start frontend
npm run dev
```

---

## 📞 Quick Reference

| Issue | Command to Check |
|-------|------------------|
| Backend running? | `curl http://localhost:5000/` |
| Port available? | `lsof -i :5000` (Mac/Linux) |
| MongoDB running? | `mongo --version` |
| Routes registered? | Check `server.js` line 45-47 |
| Token valid? | Check Network tab → see token value |

---

**That's it! Your backend should be working now. Restart the server and try again.** 🚀

