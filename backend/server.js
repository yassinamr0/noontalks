const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://ticketwave-qr.vercel.app'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  code: { type: String, unique: true },
  registeredAt: Date,
  entries: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Valid Codes Schema
const validCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true }
});

const ValidCode = mongoose.model('ValidCode', validCodeSchema);

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json('Error: ' + error);
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phone, code } = req.body;
    const upperCode = code.toUpperCase();

    // Check if code exists
    const validCode = await ValidCode.findOne({ code: upperCode });
    if (!validCode) {
      return res.status(400).json({ message: 'Invalid registration code' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      code: upperCode,
      registeredAt: new Date(),
      entries: 0
    });

    // Save user
    await newUser.save();

    // Remove used code
    await ValidCode.deleteOne({ code: upperCode });

    res.json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({ code: code.toUpperCase() });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users/scan', async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({ code: code.toUpperCase() });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    user.entries += 1;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/codes', async (req, res) => {
  try {
    const { codes } = req.body;
    const validCodes = codes.map(code => ({ code: code.toUpperCase() }));
    await ValidCode.insertMany(validCodes);
    res.json({ message: 'Codes added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
