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

// MongoDB connection with better error handling
const connectWithRetry = async () => {
  const mongoUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}`;
  
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB connected successfully');
    }
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Check for specific error types
    if (err.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check your connection string and make sure the server is running.');
    } else if (err.name === 'MongoNetworkError') {
      console.error('Network error occurred while connecting to MongoDB.');
    }
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
  code: { type: String, unique: true },
  registeredAt: { type: Date, default: Date.now },
  entries: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Valid Codes Schema
const validCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const ValidCode = mongoose.model('ValidCode', validCodeSchema);

// Function to generate a random code
function generateCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Function to generate unique codes
async function generateUniqueCodes(count) {
  const codes = new Set();
  const existingCodes = new Set((await ValidCode.find({}, 'code')).map(doc => doc.code));
  
  while (codes.size < count) {
    const code = generateCode();
    if (!existingCodes.has(code) && !codes.has(code)) {
      codes.add(code);
    }
  }
  
  return Array.from(codes);
}

// Routes with better error handling
app.get('/api/users', adminAuth, withDB(async (req, res) => {
  try {
    const users = await User.find()
      .sort({ registeredAt: -1 })
      .select('-__v') // Exclude version field
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

app.post('/api/register', withDB(async (req, res) => {
  try {
    const { name, email, phone, code } = req.body;

    // Validate required fields
    if (!name || !email || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if code exists and is not used
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
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ code: code.toUpperCase() });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
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

app.post('/api/codes/generate', adminAuth, withDB(async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 5;
    
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      return res.status(400).json({ message: 'Please enter a valid count between 1 and 100' });
    }

    const generatedCodes = await generateUniqueCodes(count);
    const validCodes = generatedCodes.map(code => ({ code }));
    
    await ValidCode.insertMany(validCodes);

    res.json(validCodes);
  } catch (error) {
    console.error('Error generating codes:', error);
    res.status(500).json({ message: 'Error generating codes', error: error.message });
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
