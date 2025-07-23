const express = require('express');
const { 
  getCategories, 
  getCategoryTree, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/tree
// @desc    Get category tree
// @access  Public
router.get('/tree', getCategoryTree);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', getCategory);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/', auth, adminAuth, createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, deleteCategory);

module.exports = router;
