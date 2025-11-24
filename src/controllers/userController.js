import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

    const user = await User.findOne({ 
    $or: [{ email: identifier }, { username: identifier }] 
  });

  if (user && (await user.matchPassword(password))) {
    // CRITICAL: Block login if user is not approved
    if (!user.isApproved) {
        res.status(401);
        throw new Error('Account pending approval. Please wait for an administrator to activate your account.');
    }
    
    // If approved, send success response
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Determine initial approval status based on role
  // Admins are generally created manually and approved. New instructors/students need approval.
  const initialApprovalStatus = (role === 'admin'); // If they somehow register as admin (should be disabled in frontend), auto-approve. Otherwise, false.

  const user = await User.create({
    username,
    email,
    password,
    role: role || 'student', 
    isApproved: initialApprovalStatus ? true : false, // New instructors/students are unapproved
  });

  if (user) {
    // On registration, we do NOT automatically log in unapproved users.
    // They must manually log in to see the approval pending message.
    res.status(201).json({
      message: 'Registration successful. Account pending admin approval.',
      // Only return minimal data
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get all users pending approval
// @route   GET /api/users/admin/pending
// @access  Private/Admin
const getPendingUsers = asyncHandler(async (req, res) => {
  // Find all users who are NOT approved
  const users = await User.find({ isApproved: false }).select('-password');
  res.json(users);
});

// @desc    Approve/Reject a user and optionally change role
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { isApproved, role } = req.body;
  
  // Construct the fields to update
  const updateFields = {};

  if (isApproved !== undefined) {
    updateFields.isApproved = isApproved;
  }
  
  const validRoles = ['student', 'instructor', 'admin'];
  if (role && validRoles.includes(role)) {
    // Only allow setting role if it's one of the valid enum values
    updateFields.role = role;
  }
  
  if (Object.keys(updateFields).length === 0) {
      res.status(400);
      throw new Error('No valid fields provided for update.');
  }

  // Use findByIdAndUpdate to only validate and update specified fields, 
  // bypassing validation for unchanged required fields (like password).
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { 
      new: true, // Return the updated document
      runValidators: true, // Run validators only on the fields we are changing
    }
  ).select('-password'); // Exclude the password from the response

  if (updatedUser) {
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