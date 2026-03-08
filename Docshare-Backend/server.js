require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
// CORS must come first so preflight OPTIONS requests get proper headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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
