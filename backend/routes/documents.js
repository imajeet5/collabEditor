const express = require('express');
const router = express.Router();
const {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');
const {
  validateCreateDocument,
  validateUpdateDocument
} = require('../middleware/validation');

// POST /api/docs - Create a new document
router.post('/', validateCreateDocument, createDocument);

// GET /api/docs - Get all documents for a user
router.get('/', getDocuments);

// GET /api/docs/:docId - Get a specific document
router.get('/:docId', getDocument);

// PUT /api/docs/:docId - Update a document
router.put('/:docId', validateUpdateDocument, updateDocument);

// DELETE /api/docs/:docId - Delete a document
router.delete('/:docId', deleteDocument);

module.exports = router;
