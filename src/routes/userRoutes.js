import express from 'express';
import { 
    authUser, 
    registerUser, 
    getPendingUsers, 
    updateUserStatus,
    deleteUser,
    getAllUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const adminRouter = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);

router.use('/admin', protect, admin, adminRouter);

adminRouter.route('/pending')
    .get(getPendingUsers); 

adminRouter.route('/all')
    .get(getAllUsers); 

adminRouter.route('/:id')
    .put(updateUserStatus)
    .delete(deleteUser); 

export default router;