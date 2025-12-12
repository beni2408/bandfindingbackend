const express = require('express');
const Connection = require('../models/Connection');
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

// Send connection request
router.post('/request', auth, async (req, res) => {
  try {
    const { recipient } = req.body;
    const existing = await Connection.findOne({
      $or: [
        { requester: req.userId, recipient },
        { requester: recipient, recipient: req.userId }
      ]
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = new Connection({
      requester: req.userId,
      recipient
    });
    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept/reject connection
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { status },
      { new: true }
    );
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user connections
router.get('/', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.userId, status: 'accepted' },
        { recipient: req.userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'name email city');
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending requests
router.get('/pending', auth, async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.userId,
      status: 'pending'
    }).populate('requester', 'name email city');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sent requests
router.get('/sent', auth, async (req, res) => {
  try {
    const requests = await Connection.find({
      requester: req.userId,
      status: 'pending'
    }).populate('recipient', 'name email city');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;