const express = require('express');
const router = express.Router();
const { get_user_profile } = require('../services/user_services');
const { protect } = require('../services/auth_services');
router.route('/profile').get(protect, get_user_profile);

module.exports = router;