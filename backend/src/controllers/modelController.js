const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const modelProcessingService = require('../services/modelProcessingService');

const prisma = new PrismaClient();

// Configure multer for GLB file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../../uploads');
    await fs.ensureDir(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only GLB files
  if (file.mimetype === 'model/gltf-binary' || file.originalname.toLowerCase().endsWith('.glb')) {
    cb(null, true);
  } else {
    cb(new Error('Only GLB files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

const getModels = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      active: true,
      ...(category && { modelCategory: category }),
      ...(userId && { userId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true, color: true, icon: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.model.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        models,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get models',
      error: error.message
    });
  }
};

const getModel = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get model',
      error: error.message
    });
  }
};

const uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No GLB file uploaded'
      });
    }

    const {
      name,
      description,
      cameraLongitude,
      cameraLatitude,
      cameraHeight,
      scale = 1.0,
      heading = 0,
      pitch = 0,
      roll = 0,
      category,
      tags = [],
      isPublic = true
    } = req.body;

    // Parse coordinates
    const longitude = parseFloat(cameraLongitude);
    const latitude = parseFloat(cameraLatitude);
    const height = parseFloat(cameraHeight);

    if (isNaN(longitude) || isNaN(latitude) || isNaN(height)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid camera coordinates provided'
      });
    }

    // Calculate ground position (5 meters below camera)
    const groundPosition = modelProcessingService.calculateGroundPosition({
      longitude,
      latitude,
      height
    }, -5);

    const modelId = uuidv4();

    // Process GLB to B3DM
    console.log('Processing GLB file for model:', modelId);
    const processingResult = await modelProcessingService.processGlbToB3dm(
      req.file.path,
      modelId
    );

    // Create model record in database
    const model = await prisma.model.create({
      data: {
        id: modelId,
        name,
        description,
        url: processingResult.url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        longitude: groundPosition.longitude,
        latitude: groundPosition.latitude,
        height: groundPosition.height,
        scale: parseFloat(scale),
        heading: parseFloat(heading),
        pitch: parseFloat(pitch),
        roll: parseFloat(roll),
        modelCategory: category,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        isPublic: Boolean(isPublic),
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Model uploaded and processed successfully',
      data: {
        ...model,
        processingResult
      }
    });
  } catch (error) {
    console.error('Error uploading model:', error);
    
    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      await fs.remove(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload and process model',
      error: error.message
    });
  }
};

const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      longitude,
      latitude,
      height,
      scale,
      heading,
      pitch,
      roll,
      category,
      tags,
      isPublic
    } = req.body;

    // Check if model exists and user owns it (or is admin)
    const existingModel = await prisma.model.findUnique({
      where: { id }
    });

    if (!existingModel) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    if (existingModel.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this model'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (height !== undefined) updateData.height = parseFloat(height);
    if (scale !== undefined) updateData.scale = parseFloat(scale);
    if (heading !== undefined) updateData.heading = parseFloat(heading);
    if (pitch !== undefined) updateData.pitch = parseFloat(pitch);
    if (roll !== undefined) updateData.roll = parseFloat(roll);
    if (category !== undefined) updateData.modelCategory = category;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
    
    updateData.updatedAt = new Date();

    const model = await prisma.model.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Model updated successfully',
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update model',
      error: error.message
    });
  }
};

const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if model exists and user owns it (or is admin)
    const existingModel = await prisma.model.findUnique({
      where: { id }
    });

    if (!existingModel) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    if (existingModel.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this model'
      });
    }

    // Delete model files
    await modelProcessingService.deleteModelFiles(id);

    // Delete from database
    await prisma.model.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete model',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  getModels,
  getModel,
  uploadModel,
  updateModel,
  deleteModel
};
