import express from 'express';
import { 
    authUser, 
    registerUser, 
    getPendingUsers, 
    updateUserStatus,
    deleteUser // ⬅️ Import the new function
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authUser);
router.post('/register', registerUser);

// Admin routes (Protected by 'protect' AND 'admin' middleware)
// GET /api/users/admin/pending
router.route('/admin/pending')
    .get(protect, admin, getPendingUsers); 

// PUT /api/users/admin/:id (Update status/role)
// DELETE /api/users/admin/:id (Permanent deletion)
router.route('/admin/:id')
    .put(protect, admin, updateUserStatus)
    .delete(protect, admin, deleteUser); // ⬅️ New DELETE route

export default router;