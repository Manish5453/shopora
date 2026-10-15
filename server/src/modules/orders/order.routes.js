const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById } = require('./order.controller');
const { protect } = require('../../middleware/auth.middleware');

router.route('/').post(protect, addOrderItems);
router.route('/:id').get(protect, getOrderById);

module.exports = router;