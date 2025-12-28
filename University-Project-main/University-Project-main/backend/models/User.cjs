const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileEducationSchema = new mongoose.Schema({
  clientId: {
    type: Number,
    required: true
  },
  degree: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  fieldOfStudy: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  gpa: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'Pakistan'
  },
  description: {
    type: String,
    default: ''
  },
  files: {
    type: Array,
    default: []
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    match: [/^AUTO-\d{4}$/, 'Employee ID must be in format AUTO-0001']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(value) {
        if (!this.isModified('password')) return true;
        // At least 8 chars, one digit, one special character
        return /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/.test(value);
      },
      message: 'Password must be at least 8 characters and include at least one number and one special character'
    }
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^03\d{9}$/, 'Phone must be 11 digits, start with 03']
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    unique: true,
    match: [/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: ['Multan', 'Islamabad', 'Kamra', 'Karachi']
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  department: {
    type: String,
    default: null
  },
  designation: {
    type: String,
    default: null
  },

  // Profile Education (frontend profile wizard)
  education: {
    type: [profileEducationSchema],
    default: []
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'reviewer'],
    default: 'user'
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for isAdmin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Virtual for isReviewer
userSchema.virtual('isReviewer').get(function() {
  return this.role === 'reviewer' || this.role === 'admin';
});

const User = mongoose.model('User', userSchema);

module.exports = User;
