const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Hauna ruhusa. Tafadhali ingia kwanza.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id);
    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({ success: false, message: 'Akaunti haipatikani.' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token si sahihi.' });
  }
};
