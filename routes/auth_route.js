const express = require('express');
const router = express.Router();
const auth_services = require('../services/auth_services');
const {
  signup,
  login,
} = require('../services/auth_services');

router.route('/signup').post(signup);
router.route('/login').post(login);

module.exports = router;