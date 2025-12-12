const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-netlify-url.netlify.app' : '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/bands', require('./routes/bands'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => {
  res.json({ message: 'JamSync API is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});