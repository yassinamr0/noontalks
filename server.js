import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Load environment variables
dotenv.config();

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Basic middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body) console.log('Body:', req.body);
  next();
});

// OPTIONS handler for preflight requests
app.options('*', cors());

// MongoDB connection
let isConnectedToMongo = false;

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');
  isConnectedToMongo = true;
} catch (err) {
  console.error('MongoDB connection error:', err);
  isConnectedToMongo = false;
}

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  qrCode: String,
  attended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Ticket schema for unverified purchases
const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  ticketType: { type: String, enum: ['single', 'group'], required: true },
  paymentMethod: { type: String, enum: ['telda', 'instapay'], required: true },
  paymentProof: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Admin token middleware
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Checking admin token:', token);
  console.log('Expected token:', process.env.ADMIN_TOKEN);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  if (token !== process.env.ADMIN_TOKEN) {
    console.log('Invalid token');
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  console.log('Token valid, proceeding');
  next();
};

// Debug endpoint (temporary)
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasAdminToken: !!process.env.ADMIN_TOKEN,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    hasMongoUri: !!process.env.MONGODB_URI,
    nodeEnv: process.env.NODE_ENV
  });
});

// API Routes
app.post('/api/admin/login', async (req, res) => {
  console.log('Login attempt:', { body: req.body });
  try {
    const { password } = req.body;
    console.log('Password received:', password);
    console.log('Expected password:', process.env.ADMIN_PASSWORD);
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    if (!process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    if (password === process.env.ADMIN_PASSWORD) {
      console.log('Password matched, sending token');
      return res.json({ 
        token: process.env.ADMIN_TOKEN,
        message: 'Login successful' 
      });
    } else {
      console.log('Password did not match');
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message 
    });
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
    res.status(500).json({ message: 'Server error while adding user', error: error.message });
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
    res.status(500).json({ message: 'Server error while fetching users', error: error.message });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:userId', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting user', 
      error: error.message 
    });
  }
});

// Validate ticket endpoint
app.post('/api/admin/validate', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        isValid: false,
        message: 'Invalid ticket' 
      });
    }

    if (user.attended) {
      return res.status(400).json({ 
        isValid: false,
        message: 'User has already attended' 
      });
    }

    user.attended = true;
    await user.save();
    res.json({ 
      isValid: true,
      user,
      message: 'Ticket validated successfully' 
    });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ 
      isValid: false,
      message: 'Server error while validating ticket', 
      error: error.message 
    });
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
    res.status(500).json({ message: 'Server error during user login', error: error.message });
  }
});

// Ticket purchase endpoint
app.post('/api/tickets/purchase', upload.single('paymentProof'), async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof is required' });
    }

    const { name, email, phone, ticketType, paymentMethod } = req.body;
    
    if (!name || !email || !ticketType || !paymentMethod) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists in either users or tickets
    const existingUser = await User.findOne({ email });
    const existingTicket = await Ticket.findOne({ email });
    
    if (existingUser || existingTicket) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const ticket = new Ticket({
      name,
      email,
      phone,
      ticketType,
      paymentMethod,
      paymentProof: `/uploads/${req.file.filename}`
    });

    await ticket.save();

    res.status(201).json({ 
      message: 'Ticket purchase submitted for verification',
      ticket
    });
  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error processing ticket purchase', error: error.message });
  }
});

// Get unverified tickets endpoint
app.get('/api/admin/tickets', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const tickets = await Ticket.find({ isVerified: false }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// Verify ticket endpoint
app.post('/api/admin/tickets/:id/verify', adminAuth, async (req, res) => {
  try {
    if (!isConnectedToMongo) {
      return res.status(503).json({ message: 'Database connection not available' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.isVerified) {
      return res.status(400).json({ message: 'Ticket already verified' });
    }

    // Generate QR code for the user
    const qrCode = Math.random().toString(36).substring(7);

    // Create user from ticket
    const user = new User({
      name: ticket.name,
      email: ticket.email,
      phone: ticket.phone,
      qrCode
    });

    await user.save();

    // Mark ticket as verified
    ticket.isVerified = true;
    ticket.verifiedAt = new Date();
    await ticket.save();

    res.json({ 
      message: 'Ticket verified and user created',
      user,
      ticket
    });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ message: 'Error verifying ticket', error: error.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Export for Vercel
export default app;

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
