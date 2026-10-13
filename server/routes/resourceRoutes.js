const express = require('express');
const { body } = require('express-validator');
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.route('/')
  .get(getResources)
  .post(
    protect,
    authorize('admin'),
    [
      body('name').trim().notEmpty().withMessage('Product name is required'),
      body('category')
        .isIn(['seeds', 'fertilizers', 'pesticides', 'tools', 'other'])
        .withMessage('Valid category is required'),
      body('price').isFloat({ min: 0 }).withMessage('Price must be greater than or equal to 0'),
      body('stock').isInt({ min: 0 }).withMessage('Stock must be an integer >= 0'),
      body('description').trim().notEmpty().withMessage('Description is required'),
      validate
    ],
    createResource
  );

router.route('/:id')
  .get(getResourceById)
  .put(protect, authorize('admin'), updateResource)
  .delete(protect, authorize('admin'), deleteResource);

module.exports = router;
