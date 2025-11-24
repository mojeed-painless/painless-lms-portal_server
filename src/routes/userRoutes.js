import express from 'express';
import { 
    authUser, 
    registerUser, 
    getPendingUsers, 
    updateUserStatus,
    deleteUser
    getAllUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authUser);
router.post('/register', registerUser);

router.use('/admin', protect, admin, adminRouter);

// Routes defined on adminRouter (prefixed by /api/users/admin)

// GET /api/users/admin/pending (List of unapproved users)
adminRouter.route('/pending')
    .get(getPendingUsers); 

// GET /api/users/admin/all (List of all users)
adminRouter.route('/all')
    .get(getAllUsers); 

// PUT /api/users/admin/:id (Update status/role)
// DELETE /api/users/admin/:id (Permanent deletion)
adminRouter.route('/:id')
    .put(updateUserStatus)
    .delete(deleteUser); 

export default router;