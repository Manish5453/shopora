const Order = require('../../models/Order.model');
const { emailQueue } = require('../../workers/email.worker');

// @desc    Create new order
// @route   POST /api/v1/orders
const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Push email notification job to BullMQ queue (Async Event-Driven Tier)
    await emailQueue.add('sendOrderConfirmation', {
      orderId: createdOrder._id,
      email: req.user.email,
    });

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json({ success: true, order });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrderItems, getOrderById };