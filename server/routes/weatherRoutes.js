const express = require('express');
const { body } = require('express-validator');
const {
  getWeather,
  getAlerts,
  createManualAlert
} = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getWeather);
router.get('/alerts', getAlerts);

router.post(
  '/alerts',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Alert title is required'),
    body('description').trim().notEmpty().withMessage('Alert description is required'),
    body('recommendedAction').trim().notEmpty().withMessage('Recommended action is required'),
    body('severity')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Severity must be low, medium, or high'),
    validate
  ],
  createManualAlert
);

module.exports = router;
