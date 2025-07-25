const express = require('express');
const { 
  upload,
  getModels, 
  getModel, 
  getActiveModelsForMap,
  getModelTileset,
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

// @route   GET /api/models/active
// @desc    Get all active models with tileset info for map display  
// @access  Public
router.get('/active', getActiveModelsForMap);

// @route   GET /api/models/active-for-map
// @desc    Get all active models with tileset info for map display (alias)
// @access  Public
router.get('/active-for-map', getActiveModelsForMap);

// @route   GET /api/models/:id
// @desc    Get model by ID
// @access  Public
router.get('/:id', getModel);

// @route   GET /api/models/:id/tileset
// @desc    Get tileset.json for specific model
// @access  Public
router.get('/:id/tileset', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getModelTileset(id);
    res.json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Tileset not found'
    });
  }
});

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
