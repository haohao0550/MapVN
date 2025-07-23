const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [userCount, modelCount, geojsonCount, categoryCount] = await Promise.all([
      prisma.user.count(),
      prisma.model.count(),
      prisma.geoJson.count(),
      prisma.category.count()
    ]);

    res.json({
      success: true,
      data: {
        users: userCount,
        models: modelCount,
        geojsons: geojsonCount,
        categories: categoryCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            models: true,
            geojsons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

module.exports = router;
