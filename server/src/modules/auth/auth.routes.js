const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile } = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;