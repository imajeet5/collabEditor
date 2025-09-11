const Document = require('../models/Document');
const { validationResult } = require('express-validator');

// Create a new document
const createDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { title, content = '', username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const document = new Document({
      title,
      content,
      owner: username,
      lastModifiedBy: username
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: {
        id: document._id,
        title: document.title,
        content: document.content,
        owner: document.owner,
        lastModified: document.lastModified,
        lastModifiedBy: document.lastModifiedBy,
        version: document.version,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all documents for a user
const getDocuments = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const documents = await Document.find({
      $or: [
        { owner: username },
        { collaborators: username }
      ]
    })
    .select('title owner lastModified lastModifiedBy version createdAt')
    .sort({ lastModified: -1 });

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a specific document
const getDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has access to the document
    const hasAccess = document.owner === username || 
                     (document.collaborators && document.collaborators.includes(username)) ||
                     document.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Document retrieved successfully',
      data: {
        id: document._id,
        title: document.title,
        content: document.content,
        owner: document.owner,
        collaborators: document.collaborators,
        lastModified: document.lastModified,
        lastModifiedBy: document.lastModifiedBy,
        version: document.version,
        isPublic: document.isPublic,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a document
const updateDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { docId } = req.params;
    const { content, title, username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has write access
    const hasWriteAccess = document.owner === username || 
                          (document.collaborators && document.collaborators.includes(username));

    if (!hasWriteAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update document
    if (content !== undefined) document.content = content;
    if (title !== undefined) document.title = title;
    document.lastModifiedBy = username;

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: {
        id: document._id,
        title: document.title,
        content: document.content,
        owner: document.owner,
        lastModified: document.lastModified,
        lastModifiedBy: document.lastModifiedBy,
        version: document.version
      }
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only owner can delete
    if (document.owner !== username) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this document'
      });
    }

    await Document.findByIdAndDelete(docId);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
};
