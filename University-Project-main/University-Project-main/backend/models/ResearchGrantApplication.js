const mongoose = require('mongoose');

const researchGrantApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Research Grant Details
  researchTitle: {
    type: String,
    required: [true, 'Research title is required'],
    trim: true,
    maxlength: [200, 'Research title cannot exceed 200 characters']
  },
  researchArea: {
    type: String,
    required: [true, 'Research area is required'],
    enum: [
      'computer-science',
      'engineering',
      'business',
      'social-sciences',
      'health-sciences',
      'arts-humanities',
      'environmental',
      'mathematics'
    ]
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 month'],
    max: [36, 'Duration cannot exceed 36 months']
  },
  budgetRequested: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget cannot be negative']
  },
  researchAbstract: {
    type: String,
    required: [true, 'Research abstract is required'],
    trim: true,
    maxlength: [2000, 'Research abstract cannot exceed 2000 characters']
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  
  // Review Information
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewComments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review comments cannot exceed 1000 characters']
  },
  reviewDate: {
    type: Date,
    default: null
  },
  
  // Funding Information
  approvedBudget: {
    type: Number,
    default: null,
    min: [0, 'Approved budget cannot be negative']
  },
  fundingStartDate: {
    type: Date,
    default: null
  },
  fundingEndDate: {
    type: Date,
    default: null
  },
  
  // Progress Tracking
  progressReports: [{
    reportDate: {
      type: Date,
      required: true
    },
    progress: {
      type: String,
      required: true,
      trim: true
    },
    challenges: {
      type: String,
      trim: true
    },
    nextSteps: {
      type: String,
      trim: true
    }
  }],
  
  // Documents
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: null
  },
  deadline: {
    type: Date,
    default: function() {
      // Set deadline to 23/09/25 at 11:59PM as mentioned in frontend
      return new Date('2025-09-23T23:59:00.000Z');
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
researchGrantApplicationSchema.index({ userId: 1 });
researchGrantApplicationSchema.index({ status: 1 });
researchGrantApplicationSchema.index({ researchArea: 1 });
researchGrantApplicationSchema.index({ submittedAt: 1 });

// Virtual for research area display name
researchGrantApplicationSchema.virtual('researchAreaDisplay').get(function() {
  const areaMap = {
    'computer-science': 'Computer Science & IT',
    'engineering': 'Engineering & Technology',
    'business': 'Business & Management',
    'social-sciences': 'Social Sciences',
    'health-sciences': 'Health Sciences & Medicine',
    'arts-humanities': 'Arts & Humanities',
    'environmental': 'Environmental Sciences',
    'mathematics': 'Mathematics & Statistics'
  };
  return areaMap[this.researchArea] || this.researchArea;
});

// Virtual for formatted budget
researchGrantApplicationSchema.virtual('formattedBudget').get(function() {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR'
  }).format(this.budgetRequested);
});

// Virtual for formatted approved budget
researchGrantApplicationSchema.virtual('formattedApprovedBudget').get(function() {
  if (!this.approvedBudget) return null;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR'
  }).format(this.approvedBudget);
});

// Virtual for application age
researchGrantApplicationSchema.virtual('applicationAge').get(function() {
  const created = new Date(this.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days until deadline
researchGrantApplicationSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is overdue
researchGrantApplicationSchema.virtual('isOverdue').get(function() {
  return this.daysUntilDeadline < 0;
});

// Method to check if application can be submitted
researchGrantApplicationSchema.methods.canSubmit = function() {
  return this.status === 'draft' && !this.isOverdue;
};

// Method to submit application
researchGrantApplicationSchema.methods.submit = function() {
  if (!this.canSubmit()) {
    throw new Error('Application cannot be submitted');
  }
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

// Method to add progress report
researchGrantApplicationSchema.methods.addProgressReport = function(report) {
  this.progressReports.push({
    reportDate: new Date(),
    ...report
  });
  return this.save();
};

// Method to add attachment
researchGrantApplicationSchema.methods.addAttachment = function(attachment) {
  this.attachments.push(attachment);
  return this.save();
};

// Static method to get applications by status
researchGrantApplicationSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('userId', 'name email employeeId');
};

// Static method to get applications by research area
researchGrantApplicationSchema.statics.getByResearchArea = function(area) {
  return this.find({ researchArea: area }).populate('userId', 'name email employeeId');
};

const ResearchGrantApplication = mongoose.model('ResearchGrantApplication', researchGrantApplicationSchema);

module.exports = ResearchGrantApplication;
