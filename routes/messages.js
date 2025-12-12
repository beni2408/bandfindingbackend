const express = require('express');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    
    // Check if users are connected
    const Connection = require('../models/Connection');
    const connection = await Connection.findOne({
      $or: [
        { requester: req.userId, recipient: receiver, status: 'accepted' },
        { requester: receiver, recipient: req.userId, status: 'accepted' }
      ]
    });
    
    if (!connection) {
      return res.status(403).json({ message: 'You can only message connected bandmates' });
    }
    
    const message = new Message({
      sender: req.userId,
      receiver,
      content
    });
    await message.save();
    await message.populate('sender', 'name');
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    }).populate('sender', 'name').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;