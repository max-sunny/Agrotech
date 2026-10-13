const Order = require('../models/Order');
const Resource = require('../models/Resource');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Farmer/Admin)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, address } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    if (!address || !address.street || !address.city || !address.pincode || !address.phone) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required'
      });
    }

    // Validate items and verify sufficient stock
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const resource = await Resource.findById(item.resource);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID ${item.resource}`
        });
      }

      if (resource.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${resource.name}'. Only ${resource.stock} available.`
        });
      }

      // Deduct stock
      resource.stock -= item.qty;
      await resource.save();

      calculatedTotal += resource.price * item.qty;
      validatedItems.push({
        resource: resource._id,
        name: resource.name,
        qty: item.qty,
        price: resource.price
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      address,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.resource', 'image category unit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.resource', 'image category unit');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order by farmer (while still pending) - restores stock
// @route   PUT /api/orders/:id/cancel
// @access  Private (Owner)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this order'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because its current status is '${order.status}'`
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Resource.findByIdAndUpdate(item.resource, {
        $inc: { stock: item.qty }
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.resource', 'image category unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'shipped', 'delivered', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If order was rejected or cancelled by admin, restore stock if it wasn't cancelled earlier
    if (
      (status === 'rejected' || status === 'cancelled') &&
      order.status !== 'rejected' &&
      order.status !== 'cancelled'
    ) {
      for (const item of order.items) {
        await Resource.findByIdAndUpdate(item.resource, {
          $inc: { stock: item.qty }
        });
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};
