const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const WeatherData = require('../models/WeatherData');
const { generatePestAlerts } = require('../utils/pestAnalyzer');

// @desc    Get all farms for logged in user (or all if admin)
// @route   GET /api/farms
// @access  Private
exports.getFarms = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const farms = await Farm.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single farm by ID with crops and latest soil score (FARM-5)
// @route   GET /api/farms/:id
// @access  Private
exports.getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Check ownership
    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this farm'
      });
    }

    // Fetch related crops
    const crops = await Crop.find({ farm: farm._id }).sort({ createdAt: -1 });

    // Calculate latest soil score across crops
    let latestSoilScore = null;
    let latestSoilRating = null;
    for (const crop of crops) {
      if (crop.soilReports && crop.soilReports.length > 0) {
        const sortedReports = [...crop.soilReports].sort((a, b) => new Date(b.date) - new Date(a.date));
        latestSoilScore = sortedReports[0].score;
        latestSoilRating = sortedReports[0].rating;
        break;
      }
    }

    // Get active pest alerts for this farm location if available
    let activeAlerts = [];
    const cachedWeather = await WeatherData.findOne({
      location: farm.location.toLowerCase().trim()
    }).sort({ date: -1 });

    if (cachedWeather && cachedWeather.pestAlert) {
      activeAlerts = cachedWeather.pestAlert;
    }

    res.status(200).json({
      success: true,
      data: {
        ...farm.toObject(),
        crops,
        summary: {
          totalCrops: crops.length,
          activeCrops: crops.filter(c => c.status === 'sown' || c.status === 'growing').length,
          latestSoilScore,
          latestSoilRating,
          activeAlertsCount: activeAlerts.length
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new farm
// @route   POST /api/farms
// @access  Private (Farmer)
exports.createFarm = async (req, res, next) => {
  try {
    const { name, location, areaInAcres, soilType, waterSource } = req.body;

    const farm = await Farm.create({
      owner: req.user._id,
      name,
      location,
      areaInAcres,
      soilType: soilType || 'Loamy',
      waterSource: waterSource || 'Borewell'
    });

    res.status(201).json({
      success: true,
      data: farm
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update farm
// @route   PUT /api/farms/:id
// @access  Private (Owner or admin)
exports.updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Check ownership
    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farm'
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: farm
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete farm (with confirmation and cascade crop deletion)
// @route   DELETE /api/farms/:id
// @access  Private (Owner or admin)
exports.deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Check ownership
    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farm'
      });
    }

    // Cascade delete crops associated with this farm
    await Crop.deleteMany({ farm: farm._id });
    await farm.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Farm and associated crops deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
