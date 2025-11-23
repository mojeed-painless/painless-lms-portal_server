import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // Bad Request
    throw new Error('User already exists with that email');
  }

  // 2. Create the user
  const user = await User.create({
    username,
    email,
    password, // Mongoose pre-save middleware will hash this
    role: role || 'student',
    isApproved: false,
  });

  // 3. Respond with user data and the token
  if (user) {
    res.status(201).json({ // 201 Created
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Send JWT to client
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});







// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; 
  // We use 'identifier' because the user can log in with EITHER username or email

  // 1. Find the user by EITHER username OR email
  const user = await User.findOne({ 
    $or: [{ email: identifier }, { username: identifier }] 
  });

  // 2. Check if the user exists AND if the password matches
  if (user && (await user.matchPassword(password))) {
    if (!user.isApproved) {
        return res.status(401).json({
        status: 'error',
        code: 'ACCOUNT_PENDING',
        errorType: 'approval_pending',
        message: 'Account pending approval. Please wait for an administrator to activate your account.',
        ui: {
          presentation: 'banner',   // frontend: banner | modal | inline
          severity: 'warning',      // frontend: info | warning | error
          cssClass: 'pending-state' // optional CSS hook
        },
        retryable: false
      });
    
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Generate new JWT
    });
  } else {
    // 4. Failure
    res.status(401); // 401 Unauthorized
    throw new Error('Invalid credentials (Username/Email or Password)');
  }
});






// @desc    Get all users pending approval
// @route   GET /api/users/admin/pending
// @access  Private/Admin
const getPendingUsers = asyncHandler(async (req, res) => {
  // Find all users who are not approved
  const users = await User.find({ isApproved: false }).select('-password');
  res.json(users);
});








// @desc    Approve/Reject a user and optionally change role
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const { isApproved, role } = req.body;

  if (user) {
    // Prevent admin from locking out the main admin account (optional security)
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
        res.status(403);
        throw new Error('Cannot modify another admin account.');
    }
    
    // Update fields only if they are provided in the request body
    if (isApproved !== undefined) {
        user.isApproved = isApproved;
    }
    if (role && ['student', 'instructor', 'admin'].includes(role)) {
        user.role = role;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      isApproved: updatedUser.isApproved,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


export { 
    authUser, 
    registerUser, 
    getPendingUsers, 
    updateUserStatus 
};