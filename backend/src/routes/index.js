const express = require('express');
const router  = express.Router();

const authCtrl = require('../controllers/auth.controller');
const matCtrl  = require('../controllers/materials.controller');
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');

const fileUpload = upload.fields([
  { name: 'file',  maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

// ── PUBLIC ────────────────────────────────────────────────────
router.get('/subjects',            matCtrl.getSubjects);
router.get('/materials',           matCtrl.getMaterials);
router.get('/materials/:id',       matCtrl.getMaterial);
router.get('/materials/:id/download', matCtrl.downloadMaterial);

// ── ADMIN AUTH ─────────────────────────────────────────────────
router.post('/admin/seed',  authCtrl.seedAdmin);
router.post('/admin/login', authCtrl.login);

// ── ADMIN PROTECTED ────────────────────────────────────────────
router.get('/admin/stats',        protect, matCtrl.adminStats);
router.get('/admin/materials',    protect, matCtrl.adminGetMaterials);
router.post('/admin/materials',   protect, fileUpload, matCtrl.createMaterial);
router.put('/admin/materials/:id',protect, fileUpload, matCtrl.updateMaterial);
router.delete('/admin/materials/:id', protect, matCtrl.deleteMaterial);

module.exports = router;
