const mongoose = require('mongoose');

const authEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['register', 'login', 'forgot_password'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

authEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuthEvent', authEventSchema);
