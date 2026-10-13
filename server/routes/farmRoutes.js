const express = require('express');
const { body } = require('express-validator');
const {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm
} = require('../controllers/farmController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getFarms)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Farm name is required'),
      body('location').trim().notEmpty().withMessage('Location is required'),
      body('areaInAcres')
        .isFloat({ gt: 0 })
        .withMessage('Area in acres must be greater than 0'),
      validate
    ],
    createFarm
  );

router
  .route('/:id')
  .get(getFarmById)
  .put(
    [
      body('name').optional().trim().notEmpty().withMessage('Farm name cannot be empty'),
      body('areaInAcres')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Area in acres must be greater than 0'),
      validate
    ],
    updateFarm
  )
  .delete(deleteFarm);

// Nested crops routes (PRD Section 11: GET, POST /farms/:farmId/crops)
const { getCropsByFarm, createCrop } = require('../controllers/cropController');

router
  .route('/:farmId/crops')
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

module.exports = router;
