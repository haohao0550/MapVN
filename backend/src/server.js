const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const modelRoutes = require('./api/models');
const geojsonRoutes = require('./api/geojsons');
const categoryRoutes = require('./api/categories');
const adminRoutes = require('./api/admin');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with CORS headers for 3D Tiles
const corsStaticMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Set appropriate content types for 3D Tiles files
  if (req.path.endsWith('.json')) {
    res.type('application/json');
  } else if (req.path.endsWith('.b3dm')) {
    res.type('application/octet-stream');
  } else if (req.path.endsWith('.i3dm')) {
    res.type('application/octet-stream');
  } else if (req.path.endsWith('.pnts')) {
    res.type('application/octet-stream');
  } else if (req.path.endsWith('.cmpt')) {
    res.type('application/octet-stream');
  }
  
  next();
};

app.use('/uploads', express.static('uploads'));
app.use('/models', corsStaticMiddleware, express.static(path.join(__dirname, '../../wwwroot/models')));
app.use('/3dmodel', corsStaticMiddleware, express.static(path.join(__dirname, '../../wwwroot/3dmodel')));
app.use('/geojsonmodel', express.static(path.join(__dirname, '../../wwwroot/geojsonmodel')));

// Dynamic tileset.json endpoint
app.get('/3dmodel/:modelId/tileset.json', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { getModelTileset } = require('./controllers/modelController');
    
    const result = await getModelTileset(modelId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    res.json(result.data.tileset);
  } catch (error) {
    console.error('Error serving tileset:', error);
    res.status(404).json({
      error: 'Tileset not found',
      message: error.message
    });
  }
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No Content
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DTHub Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/geojsons', geojsonRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DTHub Backend Server running on port ${PORT}`);
  console.log(`📡 API Documentation: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
