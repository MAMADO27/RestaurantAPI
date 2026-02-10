const express = require('express');
const router = express.Router();
const { get_user_profile ,update_user } = require('../services/user_services');
const { protect } = require('../services/auth_services');
router.route('/profile').get(protect, get_user_profile);
router.route('/:id').put(protect, update_user);

module.exports = router;