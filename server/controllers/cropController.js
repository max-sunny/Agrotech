const Crop = require('../models/Crop');
const Farm = require('../models/Farm');

// Helper to check user owns the farm
const verifyFarmOwnership = async (farmId, userId, userRole) => {
  const farm = await Farm.findById(farmId);
  if (!farm) {
    const error = new Error('Farm not found');
    error.statusCode = 404;
    throw error;
  }
  if (farm.owner.toString() !== userId.toString() && userRole !== 'admin') {
    const error = new Error('Not authorized to access crops on this farm');
    error.statusCode = 403;
    throw error;
  }
  return farm;
};

// @desc    Get all crops across all farms of logged-in user
// @route   GET /api/crops
// @access  Private
exports.getAllUserCrops = async (req, res, next) => {
  try {
    let farmIds;
    if (req.user.role === 'admin') {
      const crops = await Crop.find().populate('farm', 'name location').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: crops.length, data: crops });
    }

    const userFarms = await Farm.find({ owner: req.user._id }).select('_id');
    farmIds = userFarms.map(f => f._id);

    const crops = await Crop.find({ farm: { $in: farmIds } })
      .populate('farm', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get crops by farm ID
// @route   GET /api/farms/:farmId/crops or /api/crops/farm/:farmId
// @access  Private
exports.getCropsByFarm = async (req, res, next) => {
  try {
    const farmId = req.params.farmId || req.query.farmId || req.body.farmId;
    if (!farmId) {
      return res.status(400).json({ success: false, message: 'Farm ID is required' });
    }
    await verifyFarmOwnership(farmId, req.user._id, req.user.role);
    const crops = await Crop.find({ farm: farmId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create crop for a farm
// @route   POST /api/farms/:farmId/crops or /api/crops/farm/:farmId or POST /api/crops
// @access  Private
exports.createCrop = async (req, res, next) => {
  try {
    const farmId = req.params.farmId || req.body.farmId || req.body.farm;
    if (!farmId) {
      return res.status(400).json({ success: false, message: 'Farm ID is required' });
    }
    await verifyFarmOwnership(farmId, req.user._id, req.user.role);

    const { name, variety, sowingDate, expectedHarvest, status } = req.body;

    const crop = await Crop.create({
      farm: farmId,
      name,
      variety: variety || '',
      sowingDate,
      expectedHarvest,
      status: status || 'sown',
      soilReports: [],
      activityLogs: []
    });

    res.status(201).json({
      success: true,
      data: crop
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Private
exports.getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'name location owner');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Check farm ownership
    if (
      crop.farm.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this crop'
      });
    }

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private
exports.updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'owner');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    if (
      crop.farm.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this crop'
      });
    }

    const updated = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('farm', 'name location');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private
exports.deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'owner');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    if (
      crop.farm.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this crop'
      });
    }

    await crop.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add activity log to crop (irrigation, fertilizing, spraying, weeding)
// @route   POST /api/crops/:id/activities
// @access  Private
exports.addActivityLog = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'owner');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    if (
      crop.farm.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this crop'
      });
    }

    const { type, date, notes } = req.body;

    crop.activityLogs.unshift({
      type,
      date: date || new Date(),
      notes: notes || ''
    });

    await crop.save();

    res.status(201).json({
      success: true,
      data: crop.activityLogs
    });
  } catch (err) {
    next(err);
  }
};
