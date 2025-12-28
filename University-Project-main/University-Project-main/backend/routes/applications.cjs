const express = require('express');
const { body, validationResult } = require('express-validator');
const ResearchGrantApplication = require('../models/ResearchGrantApplication.cjs');
const User = require('../models/User.cjs');
const { protect, authorize } = require('../middleware/auth.cjs');
const { uploadDocument, uploadMultiple, handleUploadError } = require('../middleware/upload.cjs');
const { sendApplicationStatusEmail } = require('../utils/sendEmail.cjs');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all applications for current user
// @route   GET /api/applications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ResearchGrantApplication.countDocuments({ userId: req.user.id });

    const applications = await ResearchGrantApplication.find({ userId: req.user.id })
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
      count: applications.length,
      pagination,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const application = await ResearchGrantApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('reviewerId', 'name email employeeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
router.post('/', [
  body('researchTitle').trim().isLength({ min: 1, max: 200 }).withMessage('Research title is required and cannot exceed 200 characters'),
  body('researchArea').isIn([
    'computer-science', 'engineering', 'business', 'social-sciences',
    'health-sciences', 'arts-humanities', 'environmental', 'mathematics'
  ]).withMessage('Invalid research area'),
  body('duration').isInt({ min: 1, max: 36 }).withMessage('Duration must be between 1 and 36 months'),
  body('budgetRequested').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('researchAbstract').trim().isLength({ min: 1, max: 2000 }).withMessage('Research abstract is required and cannot exceed 2000 characters')
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

    const applicationData = {
      ...req.body,
      userId: req.user.id
    };

    const application = await ResearchGrantApplication.create(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
router.put('/:id', [
  body('researchTitle').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Research title cannot exceed 200 characters'),
  body('researchArea').optional().isIn([
    'computer-science', 'engineering', 'business', 'social-sciences',
    'health-sciences', 'arts-humanities', 'environmental', 'mathematics'
  ]).withMessage('Invalid research area'),
  body('duration').optional().isInt({ min: 1, max: 36 }).withMessage('Duration must be between 1 and 36 months'),
  body('budgetRequested').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('researchAbstract').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Research abstract cannot exceed 2000 characters')
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

    const application = await ResearchGrantApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Prevent updates if application is submitted
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update submitted application'
      });
    }

    const updatedApplication = await ResearchGrantApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Submit application
// @route   POST /api/applications/:id/submit
// @access  Private
router.post('/:id/submit', async (req, res) => {
  try {
    const application = await ResearchGrantApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (!application.canSubmit()) {
      return res.status(400).json({
        success: false,
        error: 'Application cannot be submitted. Please check if it is in draft status and not overdue.'
      });
    }

    await application.submit();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const application = await ResearchGrantApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Prevent deletion if application is submitted
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete submitted application'
      });
    }

    await application.remove();

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Upload attachments
// @route   POST /api/applications/:id/attachments
// @access  Private
router.post('/:id/attachments', uploadMultiple, handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one file'
      });
    }

    const application = await ResearchGrantApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Prevent uploads if application is submitted
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot upload attachments to submitted application'
      });
    }

    const attachments = req.files.map(file => ({
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileType: file.mimetype
    }));

    application.attachments.push(...attachments);
    await application.save();

    res.json({
      success: true,
      message: 'Attachments uploaded successfully',
      data: {
        attachments: application.attachments
      }
    });
  } catch (error) {
    console.error('Upload attachments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add progress report
// @route   POST /api/applications/:id/progress
// @access  Private
router.post('/:id/progress', [
  body('progress').trim().notEmpty().withMessage('Progress is required'),
  body('challenges').optional().trim(),
  body('nextSteps').optional().trim()
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

    const application = await ResearchGrantApplication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    await application.addProgressReport(req.body);

    res.json({
      success: true,
      message: 'Progress report added successfully',
      data: application
    });
  } catch (error) {
    console.error('Add progress report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ==================== ADMIN/REVIEWER ROUTES ====================

// @desc    Get all applications (Admin/Reviewer only)
// @route   GET /api/applications/admin/all
// @access  Private/Admin/Reviewer
router.get('/admin/all', authorize('admin', 'reviewer'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ResearchGrantApplication.countDocuments();

    const applications = await ResearchGrantApplication.find()
      .populate('userId', 'name email employeeId')
      .populate('reviewerId', 'name email employeeId')
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
      count: applications.length,
      pagination,
      data: applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get applications by status (Admin/Reviewer only)
// @route   GET /api/applications/admin/status/:status
// @access  Private/Admin/Reviewer
router.get('/admin/status/:status', authorize('admin', 'reviewer'), async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ResearchGrantApplication.countDocuments({ status });

    const applications = await ResearchGrantApplication.find({ status })
      .populate('userId', 'name email employeeId')
      .populate('reviewerId', 'name email employeeId')
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
      count: applications.length,
      pagination,
      data: applications
    });
  } catch (error) {
    console.error('Get applications by status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Review application (Admin/Reviewer only)
// @route   PUT /api/applications/admin/:id/review
// @access  Private/Admin/Reviewer
router.put('/admin/:id/review', authorize('admin', 'reviewer'), [
  body('status').isIn(['under_review', 'approved', 'rejected']).withMessage('Invalid status'),
  body('reviewComments').optional().trim().isLength({ max: 1000 }).withMessage('Review comments cannot exceed 1000 characters'),
  body('approvedBudget').optional().isFloat({ min: 0 }).withMessage('Approved budget must be a positive number'),
  body('fundingStartDate').optional().isISO8601().withMessage('Valid funding start date is required'),
  body('fundingEndDate').optional().isISO8601().withMessage('Valid funding end date is required')
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

    const { status, reviewComments, approvedBudget, fundingStartDate, fundingEndDate } = req.body;

    const application = await ResearchGrantApplication.findById(req.params.id)
      .populate('userId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Update application
    application.status = status;
    application.reviewerId = req.user.id;
    application.reviewDate = new Date();
    application.reviewComments = reviewComments;

    if (status === 'approved') {
      application.approvedBudget = approvedBudget;
      application.fundingStartDate = fundingStartDate;
      application.fundingEndDate = fundingEndDate;
    }

    await application.save();

    // Send email notification
    try {
      await sendApplicationStatusEmail(
        application.userId.email,
        application.researchTitle,
        status,
        reviewComments
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the review if email fails
    }

    res.json({
      success: true,
      message: 'Application reviewed successfully',
      data: application
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get application statistics (Admin only)
// @route   GET /api/applications/admin/stats
// @access  Private/Admin
router.get('/admin/stats', authorize('admin'), async (req, res) => {
  try {
    const totalApplications = await ResearchGrantApplication.countDocuments();
    const draftApplications = await ResearchGrantApplication.countDocuments({ status: 'draft' });
    const submittedApplications = await ResearchGrantApplication.countDocuments({ status: 'submitted' });
    const underReviewApplications = await ResearchGrantApplication.countDocuments({ status: 'under_review' });
    const approvedApplications = await ResearchGrantApplication.countDocuments({ status: 'approved' });
    const rejectedApplications = await ResearchGrantApplication.countDocuments({ status: 'rejected' });

    // Applications by research area
    const applicationsByArea = await ResearchGrantApplication.aggregate([
      {
        $group: {
          _id: '$researchArea',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Applications by status
    const applicationsByStatus = await ResearchGrantApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Total budget requested
    const totalBudgetRequested = await ResearchGrantApplication.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$budgetRequested' }
        }
      }
    ]);

    // Total budget approved
    const totalBudgetApproved = await ResearchGrantApplication.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$approvedBudget' }
        }
      }
    ]);

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = await ResearchGrantApplication.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalApplications,
        draftApplications,
        submittedApplications,
        underReviewApplications,
        approvedApplications,
        rejectedApplications,
        totalBudgetRequested: totalBudgetRequested[0]?.total || 0,
        totalBudgetApproved: totalBudgetApproved[0]?.total || 0,
        recentApplications,
        applicationsByArea,
        applicationsByStatus
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
