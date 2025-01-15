const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Custom CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://www.noon-talks.online', 
    'https://noontalk.vercel.app', 
    'http://localhost:5000', 
    'http://localhost:8000', 
    'http://127.0.0.1:5000',
    'http://127.0.0.1:8000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());

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

// Mock data
const mockUsers = [
  { id: 1, name: 'Test User 1', email: 'test1@example.com', code: 'ABC123' },
  { id: 2, name: 'Test User 2', email: 'test2@example.com', code: 'DEF456' }
];

// Add root route
app.get('/api', (req, res) => {
  res.json({ message: 'NoonTalks Test API is running' });
});

// Get users
app.get('/api/users', adminAuth, (req, res) => {
  res.json(mockUsers);
});

// Generate codes
app.post('/api/codes/generate', adminAuth, (req, res) => {
  const count = req.body.count || 5;
  const codes = Array.from({ length: count }, (_, i) => `TEST${String(i + 1).padStart(3, '0')}`);
  res.json({ codes });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
