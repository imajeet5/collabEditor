const express = require('express');
const router = express.Router();
const {
  createSession,
  updateSessionActivity,
  endSession,
  getSession
} = require('../controllers/sessionController');
const { validateCreateSession } = require('../middleware/validation');

// POST /api/sessions - Create a new session
router.post('/', validateCreateSession, createSession);

// GET /api/sessions/:sessionId - Get session info
router.get('/:sessionId', getSession);

// PUT /api/sessions/:sessionId/activity - Update session activity
router.put('/:sessionId/activity', updateSessionActivity);

// DELETE /api/sessions/:sessionId - End session
router.delete('/:sessionId', endSession);

module.exports = router;
