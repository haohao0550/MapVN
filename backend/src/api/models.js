const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getModels, 
  getModel, 
  createModel, 
  updateModel, 
  deleteModel 
} = require('../controllers/modelController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.glb', '.gltf', '.obj', '.fbx', '.dae'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only 3D model files are allowed.'));
    }
  }
});

// @route   GET /api/models
// @desc    Get all models
// @access  Public
router.get('/', getModels);

// @route   GET /api/models/:id
// @desc    Get model by ID
// @access  Public
router.get('/:id', getModel);

// @route   POST /api/models
// @desc    Create new model
// @access  Private
router.post('/', auth, upload.single('model'), createModel);

// @route   PUT /api/models/:id
// @desc    Update model
// @access  Private
router.put('/:id', auth, updateModel);

// @route   DELETE /api/models/:id
// @desc    Delete model
// @access  Private
router.delete('/:id', auth, deleteModel);

module.exports = router;
