const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Custom CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://www.noon-talks.online', 
    'https://noontalk.vercel.app',
    'https://noontalks-pynjnlwmj-yassins-projects-ff5455b4.vercel.app', // Your Vercel preview
    'http://localhost:5173',  // Vite default
    'http://localhost:4173',  // Vite preview
    'http://localhost:8000',  // Test page
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:8000'
  ];
  
  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For Vercel preview deployments
    if (origin && origin.endsWith('.vercel.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());

// Add root route
app.get('/api', (req, res) => {
  res.json({ message: 'NoonTalks Backend API is running' });
});

// Admin token
const ADMIN_TOKEN = 'noontalks2024';

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Invalid admin token' });
  }

  next();
};

// MongoDB connection with optimized settings for serverless
let cachedDb = null;

const connectWithRetry = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const mongoUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}`;
  
  try {
    console.log('Connecting to MongoDB...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000, // Reduce from 5000 to 2000
      socketTimeoutMS: 10000,         // Reduce from 45000 to 10000
      connectTimeoutMS: 2000,         // Add explicit connect timeout
      maxPoolSize: 1,                 // Reduce pool size for serverless
      minPoolSize: 0,
      maxIdleTimeMS: 5000,           // Close idle connections after 5 seconds
      keepAlive: false               // Don't keep connection alive
    };

    if (!cachedDb) {
      await mongoose.connect(mongoUrl, options);
      cachedDb = mongoose.connection;
      console.log('MongoDB connected successfully');
    }

    return cachedDb;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Wrap route handlers with better error handling
const withDB = (handler) => async (req, res) => {
  try {
    await connectWithRetry();
    return handler(req, res);
  } catch (error) {
    console.error('Database operation error:', error);
    
    if (error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database temporarily unavailable',
        error: 'Connection timeout'
      });
    }
    
    // Send appropriate error response based on error type
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(409).json({ 
        message: 'Duplicate key error',
        field: Object.keys(error.keyPattern)[0]
      });
    } else {
      return res.status(500).json({ 
        message: 'Database operation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  code: { 
    type: String, 
    unique: true,
    uppercase: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  entries: {
    type: Number,
    default: 0
  },
  lastEntry: Date
});

// Function to generate a random code
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Function to generate a unique code
async function generateUniqueCode() {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = generateCode(6);
    // Check if code exists in users collection
    const existingUser = await User.findOne({ code });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return code;
}

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/users', adminAuth, withDB(async (req, res) => {
  try {
    const users = await User.find()
      .sort({ registeredAt: -1 })
      .select('-__v')
      .lean()
      .exec();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

// Generate a single code
app.post('/api/codes/generate', adminAuth, withDB(async (req, res) => {
  try {
    const code = await generateUniqueCode();
    res.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ 
      message: 'Error generating code', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

app.post('/api/register', withDB(async (req, res) => {
  try {
    const { name, email, phone, code } = req.body;

    // Validate required fields
    if (!name || !email || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if code is already used
    const existingUser = await User.findOne({ code: code.toUpperCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Code already used',
        code: code.toUpperCase()
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      code: code.toUpperCase(),
      registeredAt: new Date(),
      entries: 0
    });

    await user.save();
    res.status(201).json({ 
      message: 'Registration successful',
      user: user.toObject({ versionKey: false })
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    } else {
      res.status(500).json({ 
        message: 'Error registering user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}));

app.post('/api/users/login', withDB(async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Missing code' });
    }

    const user = await User.findOne({ code: code.toUpperCase() });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Invalid code',
        code: code.toUpperCase()
      });
    }

    res.json({ 
      message: 'Login successful',
      user: user.toObject({ versionKey: false })
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

app.post('/api/users/scan', withDB(async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Missing code' });
    }

    const user = await User.findOne({ code: code.toUpperCase() });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Invalid ticket code',
        code: code.toUpperCase()
      });
    }

    // Update entries count
    user.entries += 1;
    user.lastEntry = new Date();
    await user.save();

    res.json({ 
      message: 'Ticket scanned successfully',
      user: user.toObject({ versionKey: false })
    });
  } catch (error) {
    console.error('Error scanning ticket:', error);
    res.status(500).json({ 
      message: 'Error scanning ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add startup logging
app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port', process.env.PORT || 3000);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('MongoDB Host:', process.env.MONGO_HOST);
});

// Export for Vercel
module.exports = app;
