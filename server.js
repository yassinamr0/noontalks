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
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// API Routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ token: process.env.ADMIN_TOKEN });
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

app.post('/api/admin/send-email', adminAuth, async (req, res) => {
  try {
    const { to, name } = req.body;

    // Send email using nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Welcome to Noon Talks!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #542c6a;">Welcome to Noon Talks!</h1>
          <p>Hello ${name},</p>
          <p>Thank you for registering for our event! You can now log in to view your ticket using your email address.</p>
          <p>Best regards,<br>Noon Talks Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
