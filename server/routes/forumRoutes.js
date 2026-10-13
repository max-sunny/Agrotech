const express = require('express');
const { body } = require('express-validator');
const {
  getPosts,
  getPostById,
  createPost,
  addReply,
  deletePost,
  deleteReply
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPosts)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('body').trim().notEmpty().withMessage('Post body is required'),
      body('category')
        .isIn(['Crops', 'Soil', 'Pests', 'Market', 'Ask an Expert'])
        .withMessage('Valid category is required'),
      validate
    ],
    createPost
  );

router
  .route('/:id')
  .get(getPostById)
  .delete(deletePost);

router.post(
  '/:id/replies',
  [
    body('body').trim().notEmpty().withMessage('Reply text is required'),
    validate
  ],
  addReply
);

router.delete('/:id/replies/:replyId', deleteReply);

module.exports = router;
