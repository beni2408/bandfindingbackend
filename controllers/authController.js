const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, instruments, genres, city } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      instruments,
      genres,
      city,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        instruments: user.instruments,
        genres: user.genres,
        city: user.city
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        instruments: user.instruments,
        genres: user.genres,
        city: user.city
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };