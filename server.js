const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let isConnectedToMongo = false;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  isConnectedToMongo = true;
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  isConnectedToMongo = false;
});

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  qrCode: String,
  attended: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Admin token middleware
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// API Routes
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    if (password === process.env.ADMIN_TOKEN) {
      res.json({ token: process.env.ADMIN_TOKEN });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Add user endpoint
app.post('/api/admin/add-user', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const { name, email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const qrCode = Math.random().toString(36).substring(7);
    const user = await User.create({ name, email, phone, qrCode });
    res.json(user);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error while adding user' });
  }
});

// Get users endpoint
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Validate ticket endpoint
app.post('/api/admin/validate', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const { qrCode } = req.body;
    const user = await User.findOne({ qrCode });

    if (!user) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    if (user.attended) {
      return res.status(400).json({ message: 'User has already attended' });
    }

    user.attended = true;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ message: 'Server error while validating ticket' });
  }
});

// User login endpoint
app.post('/api/user/login', async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error during user login' });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - must be after API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Export for Vercel
module.exports = app;

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
