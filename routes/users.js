const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Get all users (for now, will add location filtering later)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by city
router.get('/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const users = await User.find({ 
      city: { $regex: city, $options: 'i' } 
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users with filters
router.get('/search', async (req, res) => {
  try {
    const { city, instrument, genre } = req.query;
    let query = {};
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (instrument) {
      query.instruments = { $regex: instrument, $options: 'i' };
    }
    if (genre) {
      query.genres = { $regex: genre, $options: 'i' };
    }
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get nearby users (placeholder for future geolocation)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, distanceInKm } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const users = await User.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (distanceInKm || 10) * 1000
        }
      }
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;