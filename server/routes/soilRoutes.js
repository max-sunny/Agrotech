const express = require('express');
const { body } = require('express-validator');
const {
  submitSoilReport,
  getSoilReportsByCrop
} = require('../controllers/soilController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route(['/crop/:id', '/:id'])
  .get(getSoilReportsByCrop)
  .post(
    [
      body('pH').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
      body('nitrogen').isFloat({ min: 0 }).withMessage('Nitrogen must be a positive number'),
      body('phosphorus').isFloat({ min: 0 }).withMessage('Phosphorus must be a positive number'),
      body('potassium').isFloat({ min: 0 }).withMessage('Potassium must be a positive number'),
      body('moisture').isFloat({ min: 0, max: 100 }).withMessage('Moisture must be between 0 and 100%'),
      validate
    ],
    submitSoilReport
  );

module.exports = router;
