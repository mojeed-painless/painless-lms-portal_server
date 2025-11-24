import express from 'express';
import { 
    authUser, 
    registerUser, 
    getPendingUsers, 
    updateUserStatus
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.route('/register').post(registerUser);

// Admin routes (Protected by 'protect' AND 'admin' middleware)
router.route('/admin/pending').get(protect, admin, getPendingUsers); 

router.route('/admin/:id').put(protect, admin, updateUserStatus);

    
export default router;