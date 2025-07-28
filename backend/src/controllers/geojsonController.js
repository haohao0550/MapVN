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
      })
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
    res.status(500).json({
      success: false,
      message: 'Failed to get GeoJSONs',
      error: error.message
    });
  }
};

const getGeoJson = async (req, res) => {
  try {
    const { id } = req.params;

    const geojson = await prisma.geoJson.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
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

    res.json({
      success: true,
      data: geojson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get GeoJSON',
      error: error.message
    });
  }
};

// New endpoint to get available provinces for XaPhuong mode
const getAvailableProvinces = async (req, res) => {
  try {
    // Get GeoJSONs that are not the main Vietnam map (exclude 'Viet_Nam')
    // These would be the provinces/cities that have ward/commune data
    const provinces = await prisma.geoJson.findMany({
      where: {
        AND: [
          { name: { not: 'Viet_Nam' } }, // Exclude the main Vietnam map
          { isPublic: true }, // Only public GeoJSONs
          // You can add more conditions here based on your data structure
          // For example, if you have a type field: { type: 'xaphuong' }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedProvinces = provinces.map(province => ({
      id: province.id,
      name: province.name,
      description: province.description,
      type: province.type
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

// Alternative: Get provinces by type (if you have a type field in your schema)
const getProvincesByType = async (req, res) => {
  try {
    const { type = 'xaphuong' } = req.query;
    
    const provinces = await prisma.geoJson.findMany({
      where: {
        type: type,
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedProvinces = provinces.map(province => ({
      id: province.id,
      name: province.name,
      description: province.description,
      type: province.type
    }));

    res.json({
      success: true,
      data: formattedProvinces
    });
  } catch (error) {
    console.error('Error fetching provinces by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provinces by type',
      error: error.message
    });
  }
};

const createGeoJson = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      data,
      categoryId,
      isPublic = true
    } = req.body;

    const geojson = await prisma.geoJson.create({
      data: {
        name,
        description,
        type,
        data,
        categoryId,
        isPublic: Boolean(isPublic),
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
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
    const updateData = req.body;

    // Check if geojson exists and user owns it (or is admin)
    const existingGeoJson = await prisma.geoJson.findUnique({
      where: { id }
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
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
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

    // Check if geojson exists and user owns it (or is admin)
    const existingGeoJson = await prisma.geoJson.findUnique({
      where: { id }
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
      where: { id }
    });

    res.json({
      success: true,
      message: 'GeoJSON deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete GeoJSON',
      error: error.message
    });
  }
};

module.exports = {
  getGeoJsons,
  getGeoJson,
  createGeoJson,
  updateGeoJson,
  deleteGeoJson,
  getAvailableProvinces,
  getProvincesByType
};