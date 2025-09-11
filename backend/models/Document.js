const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    default: '',
    maxlength: 1000000 // 1MB limit for content
  },
  owner: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  collaborators: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  lastModified: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ collaborators: 1 });
documentSchema.index({ title: 'text', content: 'text' });

// Update lastModified and version on save
documentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.lastModified = new Date();
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
