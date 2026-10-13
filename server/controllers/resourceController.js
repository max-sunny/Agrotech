const Resource = require('../models/Resource');

// @desc    Get resources with search, filter, pagination
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: resources.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new resource (Admin only)
// @route   POST /api/resources
// @access  Private (Admin)
exports.createResource = async (req, res, next) => {
  try {
    const { name, category, price, stock, description, image, unit } = req.body;

    const resource = await Resource.create({
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      description,
      image: image || '',
      unit: unit || 'kg'
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resource (Admin only)
// @route   PUT /api/resources/:id
// @access  Private (Admin)
exports.updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource (Admin only)
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
