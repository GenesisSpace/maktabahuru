const mongoose = require('mongoose');

// ── Tanzania education levels ────────────────────────────────
const CLASSES = [
  'Chekechea',
  'Darasa la 1', 'Darasa la 2', 'Darasa la 3', 'Darasa la 4',
  'Darasa la 5', 'Darasa la 6', 'Darasa la 7',
  'Form I', 'Form II', 'Form III', 'Form IV',
  'Zote',
];

// ── Subjects ────────────────────────────────────────────────
const SUBJECTS = [
  'Hisabati',
  'Sayansi',
  'Kiingereza',
  'Kiswahili',
  'Historia',
  'Jiografia',
  'Uraia na Maadili',
  'Biologia',
  'Kemia',
  'Fizikia',
  'Sanaa',
  'Muziki',
  'Kompyuta',
  'Dini ya Kiislamu',
  'Elimu ya Dini',
  'Hadithi za Watoto',
  'Nyimbo za Watoto',
  'Michezo',
];

// ── Schema ──────────────────────────────────────────────────
const materialSchema = new mongoose.Schema(
  {
    // Metadata
    title:         { type: String, required: true, trim: true },
    titleSw:       { type: String, default: '' },
    description:   { type: String, default: '' },
    author:        { type: String, default: '' },
    coverImage:    { type: String, default: null },
    publishedYear: { type: Number, default: null },

    // 🔥 KEEP THIS (no change needed)
    language: { 
      type: String, 
      enum: ['sw', 'en', 'both'], 
      default: 'sw' 
    },

    // Classification
    subject:  { type: String, required: true, enum: SUBJECTS },
    classes:  [{ type: String, enum: CLASSES }],
    ageMin:   { type: Number, default: 0 },
    ageMax:   { type: Number, default: 99 },
    tags:     { type: [String], default: [] },

    isForKids:   { type: Boolean, default: false },
    isFeatured:  { type: Boolean, default: false },

    // Content type
    type:   { type: String, enum: ['book', 'video', 'story', 'audio'], required: true },
    format: { type: String, enum: ['pdf', 'epub', 'mp4', 'mp3', 'youtube', 'link'], required: true },

    // Files
    fileUrl:    { type: String, required: true },
    fileSize:   { type: Number, default: 0 },
    duration:   { type: Number, default: null },
    isExternal: { type: Boolean, default: false },

    // Status
    isPublished: { type: Boolean, default: false },

    // Stats
    views:     { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Indexes ─────────────────────────────────────────────────

// Fast filters
materialSchema.index({ subject: 1, isPublished: 1 });
materialSchema.index({ isForKids: 1, isPublished: 1 });
materialSchema.index({ classes: 1 });
materialSchema.index({ ageMin: 1, ageMax: 1 });

// 🔥🔥 FIXED TEXT INDEX (THIS SOLVES YOUR ERROR)
materialSchema.index(
  { title: 'text', description: 'text', author: 'text' },
  { default_language: 'none' } // ✅ prevents "sw unsupported" error
);

// ── Model ──────────────────────────────────────────────────
const Material = mongoose.model('Material', materialSchema);

module.exports = { Material, SUBJECTS, CLASSES };