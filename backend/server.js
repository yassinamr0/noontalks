const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'noon2024';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-mongodb-uri';
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://www.noon-talks.online',
      'https://noontalks.vercel.app',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:8000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
      'http://127.0.0.1:8000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'No token provided',
      error: 'Authentication required'
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({
      message: 'Invalid token',
      error: 'Authentication failed'
    });
  }

  next();
};

// MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  entries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Generate unique code
async function generateUniqueCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existingUser = await User.findOne({ code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
}

// Routes
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password !== ADMIN_TOKEN) {
    return res.status(401).json({
      message: 'Invalid admin password',
      error: 'Authentication failed'
    });
  }

  res.json({
    message: 'Admin login successful',
    token: ADMIN_TOKEN
  });
});

app.post('/admin/generate-codes', adminAuth, async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 1;
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      const code = await generateUniqueCode();
      codes.push(code);
    }

    res.json({
      message: 'Codes generated successfully',
      codes
    });
  } catch (error) {
    console.error('Generate codes error:', error);
    res.status(500).json({
      message: 'Error generating codes',
      error: error.message
    });
  }
});

app.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, code } = req.body;

    if (!name || !email || !code) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Validation failed'
      });
    }

    const existingUser = await User.findOne({ code });
    if (!existingUser) {
      return res.status(404).json({
        message: 'Invalid registration code',
        error: 'Code not found'
      });
    }

    if (existingUser.name || existingUser.email) {
      return res.status(400).json({
        message: 'Code already used',
        error: 'Registration failed'
      });
    }

    existingUser.name = name;
    existingUser.email = email;
    await existingUser.save();

    res.json({
      message: 'Registration successful',
      user: existingUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        message: 'Code is required',
        error: 'Validation failed'
      });
    }

    const user = await User.findOne({ code });
    if (!user || !user.name) {
      return res.status(404).json({
        message: 'Invalid code or user not registered',
        error: 'Authentication failed'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
});

app.post('/admin/scan-ticket', adminAuth, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        message: 'Code is required',
        error: 'Validation failed'
      });
    }

    const user = await User.findOne({ code });
    if (!user || !user.name) {
      return res.status(404).json({
        message: 'Invalid ticket or user not registered',
        isValid: false
      });
    }

    user.entries += 1;
    await user.save();

    res.json({
      message: 'Ticket scanned successfully',
      isValid: true,
      user
    });
  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({
      message: 'Error scanning ticket',
      error: error.message,
      isValid: false
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
