const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        _count: {
          select: {
            models: true,
            geojsons: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

const getCategoryTree = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: {
                models: true,
                geojsons: true
              }
            }
          }
        },
        _count: {
          select: {
            models: true,
            geojsons: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get category tree',
      error: error.message
    });
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        models: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        geojsons: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, parentId, color, icon } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId,
        color,
        icon
      },
      include: {
        parent: true,
        children: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has children or associated models/geojsons
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            models: true,
            geojsons: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (category.children.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories'
      });
    }

    if (category._count.models > 0 || category._count.geojsons > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated content'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
