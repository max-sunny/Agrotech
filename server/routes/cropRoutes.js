const express = require('express');
const { body } = require('express-validator');
const {
  getAllUserCrops,
  getCropsByFarm,
  createCrop,
  getCropById,
  updateCrop,
  deleteCrop,
  addActivityLog
} = require('../controllers/cropController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Global crops route
router
  .route('/')
  .get(getAllUserCrops)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Crop name is required'),
      body('sowingDate').notEmpty().withMessage('Sowing date is required'),
      body('expectedHarvest').notEmpty().withMessage('Expected harvest date is required'),
      body('status')
        .optional()
        .isIn(['planned', 'sown', 'growing', 'harvested'])
        .withMessage('Invalid crop status'),
      validate
    ],
    createCrop
  );

// Crops within a specific farm: /api/farms/:farmId/crops
router
  .route('/farm/:farmId')
  .get(getCropsByFarm)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Crop name is required'),
      body('sowingDate').notEmpty().withMessage('Sowing date is required'),
      body('expectedHarvest').notEmpty().withMessage('Expected harvest date is required'),
      body('status')
        .optional()
        .isIn(['planned', 'sown', 'growing', 'harvested'])
        .withMessage('Invalid crop status'),
      validate
    ],
    createCrop
  );

router
  .route('/:id')
  .get(getCropById)
  .put(updateCrop)
  .delete(deleteCrop);

router.post(
  '/:id/activities',
  [
    body('type')
      .isIn(['irrigation', 'fertilizing', 'spraying', 'weeding', 'harvesting', 'other'])
      .withMessage('Valid activity type is required'),
    validate
  ],
  addActivityLog
);

const {
  submitSoilReport,
  getSoilReportsByCrop
} = require('../controllers/soilController');

router
  .route('/:id/soil')
  .get(getSoilReportsByCrop)
  .post(
    [
      body('pH').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
      body('nitrogen').isFloat({ min: 0 }).withMessage('Nitrogen must be positive'),
      body('phosphorus').isFloat({ min: 0 }).withMessage('Phosphorus must be positive'),
      body('potassium').isFloat({ min: 0 }).withMessage('Potassium must be positive'),
      body('moisture').isFloat({ min: 0, max: 100 }).withMessage('Moisture must be between 0 and 100%'),
      validate
    ],
    submitSoilReport
  );

module.exports = router;
