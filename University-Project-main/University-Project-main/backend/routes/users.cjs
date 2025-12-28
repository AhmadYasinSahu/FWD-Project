const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.cjs');
const PersonalInformation = require('../models/PersonalInformation.cjs');
const { protect, authorize } = require('../middleware/auth.cjs');
const { uploadProfilePicture, handleUploadError } = require('../middleware/upload.cjs');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const personalInfo = await PersonalInformation.findOne({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        user,
        personalInfo
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().matches(/^03\d{9}$/).withMessage('Phone must be 11 digits, start with 03'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('designation').optional().trim().isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { name, phone, department, designation } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (designation) user.designation = designation;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
router.post('/profile-picture', uploadProfilePicture, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update profile picture path
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ==================== PROFILE EDUCATION ROUTES ====================

// @desc    Get profile education list
// @route   GET /api/users/education
// @access  Private
router.get('/education', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.education || []
    });
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Replace profile education list
// @route   PUT /api/users/education
// @access  Private
router.put('/education', async (req, res) => {
  try {
    const { education } = req.body;

    if (!Array.isArray(education)) {
      return res.status(400).json({
        success: false,
        error: 'Education must be an array'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const sanitized = education
      .map((e) => ({
        clientId: Number(e.clientId) || Date.now(),
        degree: typeof e.degree === 'string' ? e.degree : '',
        institution: typeof e.institution === 'string' ? e.institution : '',
        fieldOfStudy: typeof e.fieldOfStudy === 'string' ? e.fieldOfStudy : '',
        startDate: typeof e.startDate === 'string' ? e.startDate : '',
        endDate: typeof e.endDate === 'string' ? e.endDate : '',
        gpa: typeof e.gpa === 'string' || typeof e.gpa === 'number' ? String(e.gpa) : '',
        country: typeof e.country === 'string' && e.country.trim() ? e.country.trim() : 'Pakistan',
        description: typeof e.description === 'string' ? e.description : '',
        files: Array.isArray(e.files) ? e.files : []
      }))
      .slice(0, 50);

    user.education = sanitized;
    await user.save();

    res.json({
      success: true,
      message: 'Education saved successfully',
      data: user.education
    });
  } catch (error) {
    console.error('Save education error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

const passwordPolicy = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
const passwordPolicyMsg = 'New password must be at least 8 characters and include at least one number and one special character';

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').matches(passwordPolicy).withMessage(passwordPolicyMsg)
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    const personalInfo = await PersonalInformation.findOne({ userId: req.params.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        personalInfo
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().matches(/^03\d{9}$/).withMessage('Phone must be 11 digits, start with 03'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('designation').optional().trim().isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),
  body('role').optional().isIn(['user', 'admin', 'reviewer']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { name, email, phone, department, designation, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (designation) user.designation = designation;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    await user.remove();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private/Admin
router.get('/stats/overview', authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const reviewerUsers = await User.countDocuments({ role: 'reviewer' });

    // Users by city
    const usersByCity = await User.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        adminUsers,
        reviewerUsers,
        recentRegistrations,
        usersByCity,
        usersByRole
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
