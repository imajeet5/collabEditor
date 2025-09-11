const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z0-9_]+$/
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  currentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
userSessionSchema.index({ username: 1 });
userSessionSchema.index({ sessionId: 1 });
userSessionSchema.index({ lastActivity: 1 });

// TTL index to auto-delete inactive sessions after 24 hours
userSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('UserSession', userSessionSchema);
