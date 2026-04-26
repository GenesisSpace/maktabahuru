const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Jaza email na neno la siri.' });

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Email au neno la siri si sahihi.' });

    if (!admin.isActive)
      return res.status(403).json({ success: false, message: 'Akaunti imefungwa.' });

    const token = signToken(admin._id);
    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/seed  — create first superadmin (only if none exists)
exports.seedAdmin = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0)
      return res.status(400).json({ success: false, message: 'Admin tayari yupo.' });

    const admin = await Admin.create({
      name:     req.body.name     || 'Super Admin',
      email:    req.body.email    || 'admin@maktaba.tz',
      password: req.body.password || 'Admin@1234',
      role:     'superadmin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin wa kwanza ameundwa.',
      email: admin.email,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
