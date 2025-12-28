const express = require('express');
const { body, validationResult } = require('express-validator');
const PersonalInformation = require('../models/PersonalInformation.js');
const EducationalInformation = require('../models/EducationalInformation.js');
const EmploymentInformation = require('../models/EmploymentInformation.js');
const { protect } = require('../middleware/auth.js');
const { uploadProfilePicture, handleUploadError } = require('../middleware/upload.js');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// ==================== PERSONAL INFORMATION ROUTES ====================

// @desc    Get personal information
// @route   GET /api/research/personal
// @access  Private
router.get('/personal', async (req, res) => {
  try {
    const personalInfo = await PersonalInformation.findOne({ userId: req.user.id });

    res.json({
      success: true,
      data: personalInfo
    });
  } catch (error) {
    console.error('Get personal info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create/Update personal information
// @route   POST /api/research/personal
// @access  Private
router.post('/personal', [
  body('title').isIn(['Mr', 'Mrs', 'Ms', 'Dr', 'Engr', 'Prof', 'PhD', 'Engr. Dr', 'Prof. Dr']).withMessage('Invalid title'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and cannot exceed 50 characters'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and cannot exceed 50 characters'),
  body('fatherName').trim().isLength({ min: 1, max: 100 }).withMessage('Father name is required and cannot exceed 100 characters'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('maritalStatus').isIn(['single', 'married', 'divorced']).withMessage('Invalid marital status'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('permanentAddress').trim().isLength({ min: 1, max: 500 }).withMessage('Permanent address is required and cannot exceed 500 characters'),
  body('permanentCountry').trim().notEmpty().withMessage('Permanent country is required'),
  body('permanentCity').trim().notEmpty().withMessage('Permanent city is required'),
  body('mailingAddress').trim().isLength({ min: 1, max: 500 }).withMessage('Mailing address is required and cannot exceed 500 characters'),
  body('mailingCountry').trim().notEmpty().withMessage('Mailing country is required'),
  body('mailingCity').trim().notEmpty().withMessage('Mailing city is required')
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

    const personalData = {
      ...req.body,
      userId: req.user.id
    };

    // Check if personal info already exists
    let personalInfo = await PersonalInformation.findOne({ userId: req.user.id });

    if (personalInfo) {
      // Update existing
      personalInfo = await PersonalInformation.findOneAndUpdate(
        { userId: req.user.id },
        personalData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      personalInfo = await PersonalInformation.create(personalData);
    }

    res.json({
      success: true,
      message: 'Personal information saved successfully',
      data: personalInfo
    });
  } catch (error) {
    console.error('Save personal info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Upload profile picture for personal information
// @route   POST /api/research/personal/profile-picture
// @access  Private
router.post('/personal/profile-picture', uploadProfilePicture, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    let personalInfo = await PersonalInformation.findOne({ userId: req.user.id });

    if (!personalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Personal information not found. Please complete personal information first.'
      });
    }

    // Update profile picture path
    personalInfo.profilePicture = `/uploads/${req.file.filename}`;
    await personalInfo.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: personalInfo.profilePicture
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

// ==================== EDUCATIONAL INFORMATION ROUTES ====================

// @desc    Get educational information
// @route   GET /api/research/educational
// @access  Private
router.get('/educational', async (req, res) => {
  try {
    const educationalInfo = await EducationalInformation.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: educationalInfo
    });
  } catch (error) {
    console.error('Get educational info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add educational information
// @route   POST /api/research/educational
// @access  Private
router.post('/educational', [
  body('qualificationLevel').isIn(['Doctorate', 'Masters', 'Bachelors', 'Intermediate']).withMessage('Invalid qualification level'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('institute').trim().isLength({ min: 1, max: 200 }).withMessage('Institute name is required and cannot exceed 200 characters'),
  body('discipline').trim().isLength({ min: 1, max: 100 }).withMessage('Discipline is required and cannot exceed 100 characters'),
  body('campus').trim().isLength({ min: 1, max: 100 }).withMessage('Campus is required and cannot exceed 100 characters'),
  body('department').trim().isLength({ min: 1, max: 100 }).withMessage('Department is required and cannot exceed 100 characters'),
  body('degreeType').isIn(['PhD', 'MS', 'BS']).withMessage('Invalid degree type'),
  body('sessionType').isIn(['Morning', 'Evening']).withMessage('Invalid session type'),
  body('major').trim().isLength({ min: 1, max: 100 }).withMessage('Major is required and cannot exceed 100 characters')
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

    const educationalData = {
      ...req.body,
      userId: req.user.id
    };

    const educationalInfo = await EducationalInformation.create(educationalData);

    // Update highest education flag
    await updateHighestEducation(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Educational information added successfully',
      data: educationalInfo
    });
  } catch (error) {
    console.error('Add educational info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update educational information
// @route   PUT /api/research/educational/:id
// @access  Private
router.put('/educational/:id', [
  body('qualificationLevel').optional().isIn(['Doctorate', 'Masters', 'Bachelors', 'Intermediate']).withMessage('Invalid qualification level'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('country').optional().trim().notEmpty().withMessage('Country is required'),
  body('city').optional().trim().notEmpty().withMessage('City is required'),
  body('institute').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Institute name is required and cannot exceed 200 characters'),
  body('discipline').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Discipline is required and cannot exceed 100 characters'),
  body('campus').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Campus is required and cannot exceed 100 characters'),
  body('department').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Department is required and cannot exceed 100 characters'),
  body('degreeType').optional().isIn(['PhD', 'MS', 'BS']).withMessage('Invalid degree type'),
  body('sessionType').optional().isIn(['Morning', 'Evening']).withMessage('Invalid session type'),
  body('major').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Major is required and cannot exceed 100 characters')
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

    const educationalInfo = await EducationalInformation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!educationalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Educational information not found'
      });
    }

    // Update highest education flag
    await updateHighestEducation(req.user.id);

    res.json({
      success: true,
      message: 'Educational information updated successfully',
      data: educationalInfo
    });
  } catch (error) {
    console.error('Update educational info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete educational information
// @route   DELETE /api/research/educational/:id
// @access  Private
router.delete('/educational/:id', async (req, res) => {
  try {
    const educationalInfo = await EducationalInformation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!educationalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Educational information not found'
      });
    }

    // Update highest education flag
    await updateHighestEducation(req.user.id);

    res.json({
      success: true,
      message: 'Educational information deleted successfully'
    });
  } catch (error) {
    console.error('Delete educational info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ==================== EMPLOYMENT INFORMATION ROUTES ====================

// @desc    Get employment information
// @route   GET /api/research/employment
// @access  Private
router.get('/employment', async (req, res) => {
  try {
    const employmentInfo = await EmploymentInformation.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: employmentInfo
    });
  } catch (error) {
    console.error('Get employment info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add employment information
// @route   POST /api/research/employment
// @access  Private
router.post('/employment', [
  body('organizationType').isIn(['ACADEMIC', 'PROFESSIONAL']).withMessage('Invalid organization type'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('sector').isIn(['Public', 'Private', 'Government']).withMessage('Invalid sector'),
  body('category').isIn(['University', 'Institute', 'Company']).withMessage('Invalid category'),
  body('employerName').trim().isLength({ min: 1, max: 200 }).withMessage('Employer name is required and cannot exceed 200 characters'),
  body('jobType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('jobTitle').trim().isLength({ min: 1, max: 100 }).withMessage('Job title is required and cannot exceed 100 characters'),
  body('fieldOfWork').isIn(['Research', 'Teaching', 'Administration', 'Engineering']).withMessage('Invalid field of work'),
  body('careerLevel').isIn(['Entry', 'Mid', 'Senior', 'Lead']).withMessage('Invalid career level'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
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

    const employmentData = {
      ...req.body,
      userId: req.user.id
    };

    const employmentInfo = await EmploymentInformation.create(employmentData);

    // Update current employment flag
    await updateCurrentEmployment(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Employment information added successfully',
      data: employmentInfo
    });
  } catch (error) {
    console.error('Add employment info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update employment information
// @route   PUT /api/research/employment/:id
// @access  Private
router.put('/employment/:id', [
  body('organizationType').optional().isIn(['ACADEMIC', 'PROFESSIONAL']).withMessage('Invalid organization type'),
  body('country').optional().trim().notEmpty().withMessage('Country is required'),
  body('sector').optional().isIn(['Public', 'Private', 'Government']).withMessage('Invalid sector'),
  body('category').optional().isIn(['University', 'Institute', 'Company']).withMessage('Invalid category'),
  body('employerName').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Employer name is required and cannot exceed 200 characters'),
  body('jobType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('jobTitle').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Job title is required and cannot exceed 100 characters'),
  body('fieldOfWork').optional().isIn(['Research', 'Teaching', 'Administration', 'Engineering']).withMessage('Invalid field of work'),
  body('careerLevel').optional().isIn(['Entry', 'Mid', 'Senior', 'Lead']).withMessage('Invalid career level'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required')
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

    const employmentInfo = await EmploymentInformation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!employmentInfo) {
      return res.status(404).json({
        success: false,
        error: 'Employment information not found'
      });
    }

    // Update current employment flag
    await updateCurrentEmployment(req.user.id);

    res.json({
      success: true,
      message: 'Employment information updated successfully',
      data: employmentInfo
    });
  } catch (error) {
    console.error('Update employment info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete employment information
// @route   DELETE /api/research/employment/:id
// @access  Private
router.delete('/employment/:id', async (req, res) => {
  try {
    const employmentInfo = await EmploymentInformation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!employmentInfo) {
      return res.status(404).json({
        success: false,
        error: 'Employment information not found'
      });
    }

    // Update current employment flag
    await updateCurrentEmployment(req.user.id);

    res.json({
      success: true,
      message: 'Employment information deleted successfully'
    });
  } catch (error) {
    console.error('Delete employment info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

// Update highest education flag
const updateHighestEducation = async (userId) => {
  try {
    const educations = await EducationalInformation.find({ userId }).sort({ qualificationLevel: -1 });
    
    if (educations.length > 0) {
      // Reset all flags
      await EducationalInformation.updateMany(
        { userId },
        { isHighestEducation: false }
      );
      
      // Set highest education flag for the highest level
      const highestEducation = educations[0];
      highestEducation.isHighestEducation = true;
      await highestEducation.save();
    }
  } catch (error) {
    console.error('Update highest education error:', error);
  }
};

// Update current employment flag
const updateCurrentEmployment = async (userId) => {
  try {
    const employments = await EmploymentInformation.find({ userId }).sort({ startDate: -1 });
    
    if (employments.length > 0) {
      // Reset all flags
      await EmploymentInformation.updateMany(
        { userId },
        { isCurrentEmployment: false }
      );
      
      // Set current employment flag for the most recent
      const currentEmployment = employments[0];
      currentEmployment.isCurrentEmployment = true;
      await currentEmployment.save();
    }
  } catch (error) {
    console.error('Update current employment error:', error);
  }
};

module.exports = router;
