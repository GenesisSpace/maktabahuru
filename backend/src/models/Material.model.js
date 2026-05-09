const mongoose = require('mongoose');

const CLASSES = [
  'Chekechea',
  'Darasa la 1', 'Darasa la 2', 'Darasa la 3', 'Darasa la 4',
  'Darasa la 5', 'Darasa la 6', 'Darasa la 7',
  'Form I', 'Form II', 'Form III', 'Form IV',
  'Zote',
];

const SUBJECTS = [
  'Hisabati', 'Sayansi', 'Kiingereza', 'Kiswahili',
  'Historia', 'Jiografia', 'Uraia na Maadili',
  'Biologia', 'Kemia', 'Fizikia',
  'Sanaa', 'Muziki', 'Kompyuta',
  'Dini ya Kiislamu', 'Elimu ya Dini',
  'Hadithi za Watoto', 'Nyimbo za Watoto', 'Michezo',
  'Riwaya na Tamthilia',   // Novels & Plays (Swahili)
  'Novel and Plays',       // Novels & Plays (English)
  'Maswali ya Mtihani',    // Past Papers
];

const materialSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true },
    titleSw:       { type: String, default: '' },
    description:   { type: String, default: '' },
    author:        { type: String, default: '' },
    coverImage:    { type: String, default: null },
    publishedYear: { type: Number, default: null },
    language:      { type: String, enum: ['sw', 'en', 'both'], default: 'en' }, // ← default English

    subject:   { type: String, required: true, enum: SUBJECTS },
    classes:   [{ type: String, enum: CLASSES }],
    ageMin:    { type: Number, default: 0 },
    ageMax:    { type: Number, default: 99 },
    tags:      [String],
    isForKids: { type: Boolean, default: false },
    isFeatured:{ type: Boolean, default: false },

    type:   { type: String, enum: ['book', 'video', 'story', 'audio'], required: true },
    format: { type: String, enum: ['pdf', 'epub', 'mp4', 'mp3', 'youtube', 'link'], required: true },

    fileUrl:    { type: String, required: true },
    fileSize:   { type: Number, default: 0 },
    duration:   { type: Number, default: null },
    isExternal: { type: Boolean, default: false },

    isPublished: { type: Boolean, default: false },

    views:     { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

materialSchema.index({ subject: 1, isPublished: 1 });
materialSchema.index({ isForKids: 1, isPublished: 1 });
materialSchema.index({ title: 'text', description: 'text', author: 'text' });
materialSchema.index({ classes: 1 });
materialSchema.index({ ageMin: 1, ageMax: 1 });

const Material = mongoose.model('Material', materialSchema);
module.exports = { Material, SUBJECTS, CLASSES };