const mongoose = require('mongoose');

const personalInformationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Details
  title: {
    type: String,
    required: [true, 'Title is required'],
    enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Engr', 'Prof', 'PhD', 'Engr. Dr', 'Prof. Dr']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Middle name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
    maxlength: [100, 'Father name cannot exceed 100 characters']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  maritalStatus: {
    type: String,
    required: [true, 'Marital status is required'],
    enum: ['single', 'married', 'divorced']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  
  // Address Information
  permanentAddress: {
    type: String,
    required: [true, 'Permanent address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  permanentCountry: {
    type: String,
    required: [true, 'Permanent country is required'],
    trim: true
  },
  permanentCity: {
    type: String,
    required: [true, 'Permanent city is required'],
    trim: true
  },
  mailingAddress: {
    type: String,
    required: [true, 'Mailing address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  mailingCountry: {
    type: String,
    required: [true, 'Mailing country is required'],
    trim: true
  },
  mailingCity: {
    type: String,
    required: [true, 'Mailing city is required'],
    trim: true
  },
  sameAsPermanent: {
    type: Boolean,
    default: false
  },
  
  // Nationality Information
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    match: [/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X']
  },
  nationality: {
    type: String,
    default: 'Pakistan',
    trim: true
  },
  
  // Profile Picture
  profilePicture: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
personalInformationSchema.index({ userId: 1 });

// Virtual for full name
personalInformationSchema.virtual('fullName').get(function() {
  const parts = [this.firstName];
  if (this.middleName) parts.push(this.middleName);
  parts.push(this.lastName);
  return parts.join(' ');
});

// Virtual for display name with title
personalInformationSchema.virtual('displayName').get(function() {
  return `${this.title} ${this.fullName}`;
});

// Method to check if addresses are the same
personalInformationSchema.methods.addressesMatch = function() {
  return this.sameAsPermanent && 
         this.permanentAddress === this.mailingAddress &&
         this.permanentCountry === this.mailingCountry &&
         this.permanentCity === this.mailingCity;
};

const PersonalInformation = mongoose.model('PersonalInformation', personalInformationSchema);

module.exports = PersonalInformation;
