const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authProvider === 'local';
        },
        'Please add a password',
      ],
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['self_user', 'clinician', 'admin'],
      required: [true, 'Please specify a role (self_user, clinician, or admin)'],
      default: 'self_user',
    },
    // Clinician specific metadata
    title: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: undefined,
    },
    registeringBody: {
      type: String,
      trim: true,
      default: undefined,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationRequestedAt: {
      type: Date,
      default: null,
    },
    verificationReviewedAt: {
      type: Date,
      default: null,
    },
    verificationReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      maxlength: [300, 'Rejection reason cannot exceed 300 characters'],
      default: '',
    },
    verificationRequestTimestamps: {
      type: [Date],
      default: [],
    },
    institution: {
      type: String,
      default: '',
    },
    // Clinician Portal Settings
    settings: {
      notifyUrgentEmail: {
        type: Boolean,
        default: true,
      },
      reportRangeDays: {
        type: Number,
        enum: [30, 90, 180],
        default: 90,
      },
    },
    // User preferences & verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Clean empty strings so sparse compound index does not collide on empty values
userSchema.pre('validate', function (next) {
  if (this.registrationNumber !== undefined) {
    if (typeof this.registrationNumber === 'string') {
      this.registrationNumber = this.registrationNumber.trim();
    }
    if (!this.registrationNumber) {
      this.registrationNumber = undefined;
    }
  }
  if (this.registeringBody !== undefined) {
    if (typeof this.registeringBody === 'string') {
      this.registeringBody = this.registeringBody.trim();
    }
    if (!this.registeringBody && !this.registrationNumber) {
      this.registeringBody = undefined;
    }
  }
  next();
});

// Sparse unique index on (registeringBody, registrationNumber) so two accounts cannot use the same number
userSchema.index(
  { registeringBody: 1, registrationNumber: 1 },
  { unique: true, sparse: true }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
// Returns false (instead of crashing) when user has no password (e.g. Google-only accounts)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
