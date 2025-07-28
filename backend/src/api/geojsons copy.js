const express = require('express');
const { 
  getGeoJsons, 
  getGeoJson, 
  createGeoJson, 
  updateGeoJson, 
  deleteGeoJson 
} = require('../controllers/geojsonController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/geojsons
// @desc    Get all GeoJSONs
// @access  Public
router.get('/', getGeoJsons);

// @route   GET /api/geojsons/:id
// @desc    Get GeoJSON by ID
// @access  Public
router.get('/:id', getGeoJson);

// @route   POST /api/geojsons
// @desc    Create new GeoJSON
// @access  Private
router.post('/', auth, createGeoJson);

// @route   PUT /api/geojsons/:id
// @desc    Update GeoJSON
// @access  Private
router.put('/:id', auth, updateGeoJson);

// @route   DELETE /api/geojsons/:id
// @desc    Delete GeoJSON
// @access  Private
router.delete('/:id', auth, deleteGeoJson);

module.exports = router;
