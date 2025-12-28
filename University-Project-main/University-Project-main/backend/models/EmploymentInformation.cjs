const mongoose = require('mongoose');

const employmentInformationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Employment Details
  organizationType: {
    type: String,
    required: [true, 'Organization type is required'],
    enum: ['ACADEMIC', 'PROFESSIONAL']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    enum: ['Public', 'Private', 'Government']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['University', 'Institute', 'Company']
  },
  employerName: {
    type: String,
    required: [true, 'Employer name is required'],
    trim: true,
    maxlength: [200, 'Employer name cannot exceed 200 characters']
  },
  centers: {
    type: String,
    trim: true,
    maxlength: [100, 'Centers cannot exceed 100 characters']
  },
  
  // Organization Details
  organizationName: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  organizationCountry: {
    type: String,
    trim: true
  },
  organizationCity: {
    type: String,
    trim: true
  },
  
  // Address Details
  addressCountry: {
    type: String,
    trim: true
  },
  addressCity: {
    type: String,
    trim: true
  },
  addressLine: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  
  // Contact Information
  contactCountryCode: {
    type: String,
    default: '+92',
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Contact number cannot exceed 20 characters']
  },
  officeEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website cannot exceed 200 characters']
  },
  
  // Duration
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    default: null
  },
  currentlyWorking: {
    type: Boolean,
    default: false
  },
  
  // Job Details
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  fieldOfWork: {
    type: String,
    required: [true, 'Field of work is required'],
    enum: ['Research', 'Teaching', 'Administration', 'Engineering']
  },
  careerLevel: {
    type: String,
    required: [true, 'Career level is required'],
    enum: ['Entry', 'Mid', 'Senior', 'Lead']
  },
  jobDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Job description cannot exceed 1000 characters']
  },
  
  // Status
  isCurrentEmployment: {
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
employmentInformationSchema.index({ userId: 1 });
employmentInformationSchema.index({ organizationType: 1 });
employmentInformationSchema.index({ isCurrentEmployment: 1 });

// Virtual for duration
employmentInformationSchema.virtual('duration').get(function() {
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

// Virtual for full contact number
employmentInformationSchema.virtual('fullContactNumber').get(function() {
  if (!this.contactNumber) return null;
  return `${this.contactCountryCode} ${this.contactNumber}`;
});

// Virtual for employment status
employmentInformationSchema.virtual('employmentStatus').get(function() {
  if (this.currentlyWorking) return 'Currently Working';
  if (this.endDate) return 'Completed';
  return 'Active';
});

// Method to check if employment is current
employmentInformationSchema.methods.isCurrent = function() {
  return this.currentlyWorking || (!this.endDate && this.startDate);
};

// Method to get employment period
employmentInformationSchema.methods.getEmploymentPeriod = function() {
  if (!this.startDate) return null;
  
  const start = new Date(this.startDate).toLocaleDateString();
  const end = this.endDate ? new Date(this.endDate).toLocaleDateString() : 'Present';
  
  return `${start} - ${end}`;
};

const EmploymentInformation = mongoose.model('EmploymentInformation', employmentInformationSchema);

module.exports = EmploymentInformation;
