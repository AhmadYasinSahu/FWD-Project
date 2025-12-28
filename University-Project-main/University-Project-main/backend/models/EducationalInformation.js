const mongoose = require('mongoose');

const educationalInformationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Qualification Details
  qualificationLevel: {
    type: String,
    required: [true, 'Qualification level is required'],
    enum: ['Doctorate', 'Masters', 'Bachelors', 'Intermediate']
  },
  incomplete: {
    type: Boolean,
    default: false
  },
  enrolled: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    default: null
  },
  
  // Degree/Certificate Details
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  institute: {
    type: String,
    required: [true, 'Institute name is required'],
    trim: true,
    maxlength: [200, 'Institute name cannot exceed 200 characters']
  },
  programTitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Program title cannot exceed 200 characters']
  },
  discipline: {
    type: String,
    required: [true, 'Discipline is required'],
    trim: true,
    maxlength: [100, 'Discipline cannot exceed 100 characters']
  },
  campus: {
    type: String,
    required: [true, 'Campus is required'],
    trim: true,
    maxlength: [100, 'Campus cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  degreeType: {
    type: String,
    required: [true, 'Degree type is required'],
    enum: ['PhD', 'MS', 'BS']
  },
  sessionType: {
    type: String,
    required: [true, 'Session type is required'],
    enum: ['Morning', 'Evening']
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true,
    maxlength: [100, 'Major cannot exceed 100 characters']
  },
  researchArea: {
    type: String,
    trim: true,
    maxlength: [200, 'Research area cannot exceed 200 characters']
  },
  
  // Status
  isHighestEducation: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
educationalInformationSchema.index({ userId: 1 });
educationalInformationSchema.index({ qualificationLevel: 1 });
educationalInformationSchema.index({ isHighestEducation: 1 });

// Virtual for duration
educationalInformationSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;
  
  const endDate = this.endDate || new Date();
  const startDate = new Date(this.startDate);
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${months % 12} month${months % 12 !== 1 ? 's' : ''}`;
  }
  return `${months} month${months !== 1 ? 's' : ''}`;
});

// Virtual for status
educationalInformationSchema.virtual('status').get(function() {
  if (this.enrolled) return 'Currently Enrolled';
  if (this.incomplete) return 'Incomplete';
  if (this.endDate) return 'Completed';
  return 'In Progress';
});

// Method to check if education is complete
educationalInformationSchema.methods.isComplete = function() {
  return !this.incomplete && !this.enrolled && this.endDate;
};

// Method to get education level priority (for determining highest education)
educationalInformationSchema.methods.getLevelPriority = function() {
  const priorities = {
    'Doctorate': 4,
    'Masters': 3,
    'Bachelors': 2,
    'Intermediate': 1
  };
  return priorities[this.qualificationLevel] || 0;
};

const EducationalInformation = mongoose.model('EducationalInformation', educationalInformationSchema);

module.exports = EducationalInformation;
