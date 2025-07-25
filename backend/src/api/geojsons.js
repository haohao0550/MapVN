const express = require('express');
const path = require('path');
const fs = require('fs');
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

// @route   GET /api/geojsons/files/:filename
// @desc    Serve static GeoJSON files from Documents/VietNam
// @access  Public
router.get('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('Requested GeoJSON file:', filename);
    
    // Determine the correct path based on filename
    let filePath;
    if (filename.includes('tỉnh thành') || filename.includes('tinh thanh')) {
      filePath = path.join(__dirname, '../../../Documents/VietNam/TinhThanh', filename);
    } else {
      filePath = path.join(__dirname, '../../../Documents/VietNam/XaPhuong', filename);
    }
    
    console.log('Resolved file path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return res.status(404).json({ error: 'GeoJSON file not found' });
    }
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Read and send file
    const fileData = fs.readFileSync(filePath, 'utf8');
    res.send(fileData);
    
  } catch (error) {
    console.error('Error serving GeoJSON file:', error);
    res.status(500).json({ error: 'Error serving GeoJSON file', message: error.message });
  }
});

module.exports = router;
