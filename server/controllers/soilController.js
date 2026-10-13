const Crop = require('../models/Crop');
const { analyzeSoil } = require('../utils/soilAnalyzer');

// @desc    Submit soil test for a crop and calculate health score & recommendations
// @route   POST /api/crops/:id/soil
// @access  Private
exports.submitSoilReport = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'owner name location');

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
        message: 'Not authorized to submit soil data for this crop'
      });
    }

    const { pH, nitrogen, phosphorus, potassium, moisture } = req.body;

    const analysis = analyzeSoil({
      pH: parseFloat(pH),
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      moisture: parseFloat(moisture)
    });

    const report = {
      pH: parseFloat(pH),
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      moisture: parseFloat(moisture),
      score: analysis.score,
      rating: analysis.rating,
      recommendations: analysis.recommendations,
      date: new Date()
    };

    crop.soilReports.unshift(report);
    await crop.save();

    res.status(201).json({
      success: true,
      data: {
        report: crop.soilReports[0],
        breakdown: analysis.breakdown,
        crop: {
          id: crop._id,
          name: crop.name,
          farm: crop.farm.name
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get soil test reports and history for a crop
// @route   GET /api/crops/:id/soil
// @access  Private
exports.getSoilReportsByCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'owner name location');

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
        message: 'Not authorized to view soil reports for this crop'
      });
    }

    res.status(200).json({
      success: true,
      count: crop.soilReports.length,
      data: {
        cropId: crop._id,
        cropName: crop.name,
        farmName: crop.farm.name,
        reports: crop.soilReports
      }
    });
  } catch (err) {
    next(err);
  }
};
