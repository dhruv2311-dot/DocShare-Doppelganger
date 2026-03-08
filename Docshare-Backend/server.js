require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const shareRoutes = require('./routes/shareRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect Database
connectDB();

// Init Middleware
// ── CORS ──────────────────────────────────────────────────────────────────
// Manual CORS headers on EVERY response (including errors / 404s)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
// ──────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/share', shareRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.send('API Running'));

// 404 catch-all — tells you exactly which route is missing
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl} — Route not found`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
