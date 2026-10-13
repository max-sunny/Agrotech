const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Resource = require('../models/Resource');

// @desc    Get dashboard statistics & monthly charts
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalFarms, totalCrops, totalOrders, resources] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      Farm.countDocuments(),
      Crop.countDocuments(),
      Order.countDocuments(),
      Resource.find().select('stock price name')
    ]);

    // Calculate total revenue from delivered and approved orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['approved', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length ? revenueAgg[0].total : 0;

    // Monthly orders & revenue trends for past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Low stock resources alert (stock < 15)
    const lowStockResources = resources.filter(r => r.stock <= 15);

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalUsers,
          totalFarms,
          totalCrops,
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          lowStockCount: lowStockResources.length
        },
        monthlyTrends,
        orderStatusBreakdown,
        lowStockResources
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users with search and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    // Delete farms and crops belonging to this user
    const farms = await Farm.find({ owner: user._id }).select('_id');
    const farmIds = farms.map(f => f._id);
    await Crop.deleteMany({ farm: { $in: farmIds } });
    await Farm.deleteMany({ owner: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and associated farms deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
