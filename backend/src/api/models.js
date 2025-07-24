const express = require('express');
const { 
  upload,
  getModels, 
  getModel, 
  uploadModel, 
  updateModel, 
  deleteModel 
} = require('../controllers/modelController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/models
// @desc    Get all models
// @access  Public
router.get('/', getModels);

// @route   GET /api/models/:id
// @desc    Get model by ID
// @access  Public
router.get('/:id', getModel);

// @route   POST /api/models/upload
// @desc    Upload and process GLB model
// @access  Private
router.post('/upload', auth, upload.single('glbFile'), uploadModel);

// @route   PUT /api/models/:id
// @desc    Update model properties (position, rotation, etc.)
// @access  Private
router.put('/:id', auth, updateModel);

// @route   DELETE /api/models/:id
// @desc    Delete model
// @access  Private
router.delete('/:id', auth, deleteModel);

module.exports = router;
