const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/:id?', auth, async (req, res) => {
  try {
    const userId = req.params.id || req.userId;
    const user = await User.findById(userId).select('-password');
    const posts = await Post.find({ author: userId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });
    
    // Get bandmates count
    const Connection = require('../models/Connection');
    const connections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });
    
    res.json({
      user,
      posts,
      postsCount: posts.length,
      bandmatesCount: connections.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, bio, profilePicture, instruments, genres, city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, profilePicture, instruments, genres, city },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;