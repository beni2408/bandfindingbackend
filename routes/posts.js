const express = require('express');
const { createPost, getFeed, likePost, addComment, editPost, deletePost } = require('../controllers/postController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Create post
router.post('/', auth, createPost);

// Get feed posts
router.get('/feed', auth, getFeed);

// Like/unlike post
router.post('/:id/like', auth, likePost);

// Add comment
router.post('/:id/comment', auth, addComment);

// Edit post
router.put('/:id', auth, editPost);

// Delete post
router.delete('/:id', auth, deletePost);

module.exports = router;