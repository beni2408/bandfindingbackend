const express = require('express');
const Band = require('../models/Band');
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

// Create band
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, genre } = req.body;
    const band = new Band({
      name,
      description,
      genre,
      creator: req.userId,
      bandmates: [req.userId]
    });
    await band.save();
    await band.populate('bandmates', 'name email');
    res.status(201).json(band);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bands
router.get('/', auth, async (req, res) => {
  try {
    const bands = await Band.find({
      bandmates: req.userId
    }).populate('bandmates', 'name email');
    res.json(bands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add bandmate
router.post('/:id/bandmates', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const band = await Band.findById(req.params.id);
    if (!band.bandmates.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!band.bandmates.includes(userId)) {
      band.bandmates.push(userId);
      await band.save();
    }
    await band.populate('bandmates', 'name email');
    res.json(band);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;