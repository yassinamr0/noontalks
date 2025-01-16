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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
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
  if (token !== 'noontalks_admin_token') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// API Routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'noon2024') {
    res.json({ token: 'noontalks_admin_token' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

app.post('/api/admin/add-user', adminAuth, async (req, res) => {
  try {
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
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/validate', adminAuth, async (req, res) => {
  try {
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
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
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
    res.status(500).json({ message: 'Server error' });
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

// Export for Vercel
module.exports = app;

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
