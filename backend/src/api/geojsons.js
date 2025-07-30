const express = require('express');
const {
  getVietnamGeoJson,
  getAvailableProvinces,
  getGeoJson,
  getGeoJsons,
  createGeoJson,
  updateGeoJson,
  deleteGeoJson
} = require('../controllers/geojsonController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise Express will treat '/vietnam' and '/provinces' as IDs

// @route GET /api/geojsons/vietnam
// @desc Get Vietnam GeoJSON data only (for initial TinhThanh mode)
// @access Public
router.get('/vietnam', getVietnamGeoJson);

// @route GET /api/geojsons/provinces
// @desc Get available provinces metadata for XaPhuong dropdown (lightweight)
// @access Public
router.get('/provinces', getAvailableProvinces);

// @route GET /api/geojsons
// @desc Get all GeoJSONs with pagination (for admin/management)
// @access Public (but consider adding auth for admin features)
router.get('/', getGeoJsons);

// @route POST /api/geojsons
// @desc Create new GeoJSON
// @access Private
router.post('/', auth, createGeoJson);

// @route GET /api/geojsons/:id
// @desc Get specific GeoJSON by ID (for XaPhuong data when province selected)
// @access Public
// NOTE: This MUST come after all specific routes to avoid conflicts
router.get('/:id', getGeoJson);

// @route PUT /api/geojsons/:id
// @desc Update GeoJSON
// @access Private
router.put('/:id', auth, updateGeoJson);

// @route DELETE /api/geojsons/:id
// @desc Delete GeoJSON
// @access Private
router.delete('/:id', auth, deleteGeoJson);

module.exports = router;