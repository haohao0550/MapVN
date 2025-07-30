const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

testConnection();

// Get Vietnam GeoJSON data only (id=1) for initial page load
const getVietnamGeoJson = async (req, res) => {
  try {
    const vietnamGeoJson = await prisma.geoJson.findUnique({
      where: { id: 1 }, // Vietnam data is always ID 1
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        categoryRel: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    if (!vietnamGeoJson) {
      return res.status(404).json({
        success: false,
        message: 'Vietnam GeoJSON not found'
      });
    }

    res.json({
      success: true,
      data: vietnamGeoJson
    });
  } catch (error) {
    console.error('Error fetching Vietnam GeoJSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Vietnam GeoJSON',
      error: error.message
    });
  }
};

// Get list of available provinces for XaPhuong dropdown (without heavy GeoJSON data)
const getAvailableProvinces = async (req, res) => {
  try {
    // Get provinces/cities that have ward/commune data (exclude Vietnam map id=1)
    const provinces = await prisma.geoJson.findMany({
      where: {
        AND: [
          { id: { not: 1 } }, // Exclude Vietnam map
          { isPublic: true }, // Only public GeoJSONs
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedProvinces = provinces.map(province => ({
      id: province.id.toString(), // Ensure ID is string for frontend consistency
      name: province.name,
      description: province.description,
      category: province.category
    }));

    res.json({
      success: true,
      data: formattedProvinces
    });
  } catch (error) {
    console.error('Error fetching available provinces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available provinces',
      error: error.message
    });
  }
};

// Get GeoJSON by ID (for XaPhuong data when province is selected)
const getGeoJson = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const geojson = await prisma.geoJson.findUnique({
      where: { id: numericId },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        categoryRel: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    if (!geojson) {
      return res.status(404).json({
        success: false,
        message: 'GeoJSON not found'
      });
    }

    // Only return public GeoJSONs for non-authenticated requests
    if (!geojson.isPublic && (!req.user || req.user.id !== geojson.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private GeoJSON'
      });
    }

    res.json({
      success: true,
      data: geojson
    });
  } catch (error) {
    console.error('Error fetching GeoJSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get GeoJSON',
      error: error.message
    });
  }
};

// Get all GeoJSONs with pagination (for admin or data management purposes)
const getGeoJsons = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { category: type })
    };

    const [geojsons, total] = await Promise.all([
      prisma.geoJson.findMany({
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
      prisma.geoJson.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        geojsons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching GeoJSONs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get GeoJSONs',
      error: error.message
    });
  }
};

const createGeoJson = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      data,
      tags = [],
      categoryId,
      isPublic = true
    } = req.body;

    const geojson = await prisma.geoJson.create({
      data: {
        name,
        description,
        category,
        data,
        tags,
        categoryId,
        isPublic: Boolean(isPublic),
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        categoryRel: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'GeoJSON created successfully',
      data: geojson
    });
  } catch (error) {
    console.error('Error creating GeoJSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create GeoJSON',
      error: error.message
    });
  }
};

const updateGeoJson = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    const updateData = req.body;

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Check if geojson exists and user owns it (or is admin)
    const existingGeoJson = await prisma.geoJson.findUnique({
      where: { id: numericId }
    });

    if (!existingGeoJson) {
      return res.status(404).json({
        success: false,
        message: 'GeoJSON not found'
      });
    }

    if (existingGeoJson.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this GeoJSON'
      });
    }

    const geojson = await prisma.geoJson.update({
      where: { id: numericId },
      data: updateData,
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        categoryRel: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'GeoJSON updated successfully',
      data: geojson
    });
  } catch (error) {
    console.error('Error updating GeoJSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update GeoJSON',
      error: error.message
    });
  }
};

const deleteGeoJson = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Check if geojson exists and user owns it (or is admin)
    const existingGeoJson = await prisma.geoJson.findUnique({
      where: { id: numericId }
    });

    if (!existingGeoJson) {
      return res.status(404).json({
        success: false,
        message: 'GeoJSON not found'
      });
    }

    if (existingGeoJson.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this GeoJSON'
      });
    }

    await prisma.geoJson.delete({
      where: { id: numericId }
    });

    res.json({
      success: true,
      message: 'GeoJSON deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting GeoJSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete GeoJSON',
      error: error.message
    });
  }
};

module.exports = {
  getVietnamGeoJson,      // Get only Vietnam data for initial load
  getAvailableProvinces,  // Get province metadata without heavy GeoJSON data
  getGeoJson,            // Get specific GeoJSON by ID (for XaPhuong data)
  getGeoJsons,           // For admin/management purposes
  createGeoJson,
  updateGeoJson,
  deleteGeoJson
};