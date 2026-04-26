require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const routes    = require('./routes');

const app = express();

// ── DB ─────────────────────────────────────────────────────────
connectDB();

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit on API
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '📚 Maktaba Huru API iko sawa!', env: process.env.NODE_ENV }));

// ── Error handler ──────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Kosa la seva.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Seva inaendesha kwenye http://localhost:${PORT}`));
