require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const routes    = require('./routes');

const app = express();

// ── Trust proxy (required for Render) ──────────────────────────
app.set('trust proxy', 1);

// ── DB ─────────────────────────────────────────────────────────
connectDB();

// ── Allowed origins ────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://maktabahuru.co.tz',
  'https://www.maktabahuru.co.tz',
  'https://maktabahuru.vercel.app',
];

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limit ─────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ───────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  message: '📚 Maktaba Huru API iko sawa!',
  env: process.env.NODE_ENV,
}));

// ── Error handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error.',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));