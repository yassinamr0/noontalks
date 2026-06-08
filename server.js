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

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection Caching
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log('New MongoDB connection established');
    return cachedConnection;
  } catch (e) {
    cachedConnection = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/health') || req.path.startsWith('/api/debug')) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed', error: err.message });
  }
});

// Models - Use mongoose.models to prevent OverwriteModelError in serverless
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  qrCode: String,
  ticketType: { type: String, enum: ['adult', 'kids', 'noon_students', 'single', 'group'], default: 'adult' },
  attended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, sparse: true },
  phone: String,
  ticketType: { type: String, enum: ['adult', 'kids', 'noon_students', 'single', 'group'], required: true },
  paymentMethod: { 
    type: String, 
    enum: {
      values: ['telda', 'instapay'],
      message: 'Payment method must be either telda or instapay'
    },
    default: null,
    sparse: true
  },
  paymentProof: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  createdAt: { type: Date, default: Date.now }
}));

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Admin auth
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Endpoints
app.get('/api/health', async (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ status: 'ok', mongoConnected: connected, timestamp: new Date().toISOString() });
});

app.get('/api/debug/env', (req, res) => {
  res.json({
    hasAdminToken: !!process.env.ADMIN_TOKEN,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: process.env.ADMIN_TOKEN, message: 'Login successful' });
  }
  res.status(401).json({ message: 'Invalid password' });
});

// Add user endpoint
app.post('/api/admin/add-user', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, ticketType } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const qrCode = Math.random().toString(36).substring(7);
    const user = await User.create({ 
      name, 
      email, 
      phone, 
      qrCode,
      ticketType: ticketType || 'adult'
    });
    res.json(user);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error while adding user', error: error.message });
  }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    // Also delete any associated ticket with the same email
    await Ticket.deleteOne({ email: user.email });
    
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

app.post('/api/tickets/purchase', upload.single('paymentProof'), async (req, res) => {
  try {
    const { name, email, phone, ticketType, paymentMethod } = req.body;
    if (!name || !email || !ticketType || !req.file) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const existingTicket = await Ticket.findOne({ email, isVerified: false });
    if (existingTicket) return res.status(400).json({ message: 'Pending ticket already exists' });

    const fileBase64 = req.file.buffer.toString('base64');
    const fileData = `data:${req.file.mimetype};base64,${fileBase64}`;

    const ticket = await Ticket.create({
      name, email, phone, ticketType, paymentMethod, paymentProof: fileData
    });

    res.json({ message: 'Ticket purchase submitted', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Purchase error', error: error.message });
  }
});

// User login
app.post('/api/user/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// Admin validate
app.post('/api/admin/validate', adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ isValid: false, message: 'Invalid ticket' });
    if (user.attended) return res.status(400).json({ isValid: false, message: 'Already attended' });
    
    user.attended = true;
    await user.save();
    res.json({ isValid: true, user, message: 'Validated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Validation error', error: error.message });
  }
});

// Admin tickets
app.get('/api/admin/tickets', adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ isVerified: false }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// Delete unverified ticket endpoint
app.delete('/api/admin/tickets/:id', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
});

// Admin verify ticket
app.post('/api/admin/tickets/:id/verify', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.isVerified) return res.status(404).json({ message: 'Ticket not found or verified' });

    const qrCode = Math.random().toString(36).substring(7);
    const user = await User.create({
      name: ticket.name,
      email: ticket.email,
      phone: ticket.phone,
      qrCode,
      ticketType: ticket.ticketType
    });

    ticket.isVerified = true;
    ticket.verifiedAt = new Date();
    await ticket.save();

    res.json({ message: 'Ticket verified', user });
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
});

// SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
