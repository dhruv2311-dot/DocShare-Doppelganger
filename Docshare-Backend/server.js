require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const shareRoutes = require('./routes/shareRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect Database
connectDB();

// ── CORS ──────────────────────────────────────────────────────────────────
// Must be the FIRST middleware so headers are set even on errors/404s
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
// ──────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — used by keep-alive ping and uptime monitors
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Define Routes
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/share', shareRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.send('API Running'));

// 404 catch-all
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl} — Route not found`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

  // ── Keep-alive: prevent Render free tier from sleeping ────────────────
  // Render spins down after 15 min of inactivity; ping ourselves every 14 min.
  if (process.env.RENDER) {
    const selfUrl = process.env.RENDER_EXTERNAL_URL;
    if (selfUrl) {
      const pingFn = selfUrl.startsWith('https') ? https : http;
      setInterval(() => {
        pingFn.get(`${selfUrl}/health`, (res) => {
          console.log(`[keep-alive] pinged /health → ${res.statusCode}`);
        }).on('error', (err) => {
          console.warn('[keep-alive] ping failed:', err.message);
        });
      }, 14 * 60 * 1000);
      console.log(`[keep-alive] scheduled every 14 min → ${selfUrl}/health`);
    }
  }
  // ─────────────────────────────────────────────────────────────────────
});

module.exports = app;
