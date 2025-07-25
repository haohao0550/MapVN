const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getModels = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      active: true,
      ...(category && { categoryId: category }),
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
            select: { id: true, username: true, email: true }
          },
          categoryRel: {
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

const createModel = async (req, res) => {
  try {
    const {
      name,
      description,
      latitude,
      longitude,
      altitude = 0,
      heading = 0,
      pitch = 0,
      roll = 0,
      scale = 1,
      categoryId,
      isPublic = true
    } = req.body;

    const model = await prisma.model.create({
      data: {
        name,
        description,
        filePath: req.file ? `/uploads/${req.file.filename}` : null,
        fileSize: req.file ? req.file.size : null,
        mimeType: req.file ? req.file.mimetype : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        altitude: parseFloat(altitude),
        heading: parseFloat(heading),
        pitch: parseFloat(pitch),
        roll: parseFloat(roll),
        scale: parseFloat(scale),
        categoryId,
        isPublic: Boolean(isPublic),
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Model created successfully',
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create model',
      error: error.message
    });
  }
};

const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel
};
