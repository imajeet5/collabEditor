const UserSession = require('../models/UserSession');
const { v4: uuidv4 } = require('uuid');

// Create a new user session
const createSession = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid username is required'
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username) || username.length < 2 || username.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 2-50 characters long and contain only letters, numbers, and underscores'
      });
    }

    // Check if user already has an active session
    let existingSession = await UserSession.findOne({ 
      username, 
      isActive: true 
    });

    if (existingSession) {
      // Update existing session
      existingSession.lastActivity = new Date();
      await existingSession.save();

      return res.json({
        success: true,
        message: 'Session resumed',
        data: {
          sessionId: existingSession.sessionId,
          username: existingSession.username,
          lastActivity: existingSession.lastActivity
        }
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const session = new UserSession({
      username,
      sessionId,
      lastActivity: new Date()
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        sessionId: session.sessionId,
        username: session.username,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update session activity
const updateSessionActivity = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await UserSession.findOne({ sessionId, isActive: true });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired'
      });
    }

    session.lastActivity = new Date();
    await session.save();

    res.json({
      success: true,
      message: 'Session activity updated',
      data: {
        sessionId: session.sessionId,
        username: session.username,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// End session
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await UserSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get session info
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await UserSession.findOne({ 
      sessionId, 
      isActive: true 
    }).populate('currentDocument', 'title');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired'
      });
    }

    res.json({
      success: true,
      message: 'Session retrieved successfully',
      data: {
        sessionId: session.sessionId,
        username: session.username,
        lastActivity: session.lastActivity,
        currentDocument: session.currentDocument,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createSession,
  updateSessionActivity,
  endSession,
  getSession
};
