const express = require('express');
const { searchUsers } = require('../controllers/users');

const router = express.Router();

// ===== User Search =====
router
  .route('/search')
  .post(searchUsers);

module.exports = router;
