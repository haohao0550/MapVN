const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router;
