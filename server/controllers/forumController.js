const Post = require('../models/Post');

// @desc    Get all forum posts with category filtering and pagination
// @route   GET /api/posts
// @access  Private
exports.getPosts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, body, category } = req.body;

    const isExpert = category === 'Ask an Expert';

    const post = await Post.create({
      author: req.user._id,
      title,
      body,
      category,
      isExpertFlagged: isExpert,
      replies: []
    });

    const populated = await Post.findById(post._id).populate('author', 'name role');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add reply to post
// @route   POST /api/posts/:id/replies
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply text cannot be empty'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.replies.push({
      author: req.user._id,
      body: body.trim(),
      createdAt: new Date()
    });

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.status(201).json({
      success: true,
      data: updatedPost
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post (Author or Admin)
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete reply (Author or Admin)
// @route   DELETE /api/posts/:id/replies/:replyId
// @access  Private (Author or Admin)
exports.deleteReply = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = post.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    if (
      reply.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    post.replies.pull(req.params.replyId);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
