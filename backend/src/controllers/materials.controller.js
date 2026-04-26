const { Material, SUBJECTS, CLASSES } = require('../models/Material.model');

// ── PUBLIC ────────────────────────────────────────────────────

exports.getMaterials = async (req, res) => {
  try {
    const { subject, type, classLevel, ageMin, ageMax, isForKids, search, page = 1, limit = 24 } = req.query;
    const filter = { isPublished: true };
    if (subject)              filter.subject = subject;
    if (type)                 filter.type = type;
    if (classLevel)           filter.classes = classLevel;
    if (isForKids === 'true') filter.isForKids = true;
    if (ageMin !== undefined || ageMax !== undefined) {
      filter.ageMin = { $lte: Number(ageMax) || 99 };
      filter.ageMax = { $gte: Number(ageMin) || 0 };
    }
    if (search) filter.$text = { $search: search };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Material.countDocuments(filter);
    const items = await Material.find(filter)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip).limit(Number(limit)).lean();

    res.json({ success: true, data: items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error('❌ getMaterials:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id).lean();
    if (!mat || !mat.isPublished) return res.status(404).json({ success: false, message: 'Hakuna nyenzo hiyo.' });
    await Material.findByIdAndUpdate(mat._id, { $inc: { views: 1 } });
    res.json({ success: true, data: mat });
  } catch (err) {
    console.error('❌ getMaterial:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadMaterial = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id).lean();
    if (!mat || !mat.isPublished) return res.status(404).json({ success: false, message: 'Hakuna nyenzo hiyo.' });
    await Material.findByIdAndUpdate(mat._id, { $inc: { downloads: 1 } });
    res.json({ success: true, url: mat.fileUrl });
  } catch (err) {
    console.error('❌ downloadMaterial:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const counts = await Material.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(counts.map(c => [c._id, c.count]));
    res.json({
      success: true,
      data: SUBJECTS.map(s => ({ name: s, count: map[s] || 0 })),
      allSubjects: SUBJECTS,
      allClasses: CLASSES,
    });
  } catch (err) {
    console.error('❌ getSubjects:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN ─────────────────────────────────────────────────────

function parseBody(body, files) {
  // ── File URLs from uploaded files (set by upload.js middleware) ──
  if (files?.file?.[0])  body.fileUrl    = files.file[0].path;
  if (files?.cover?.[0]) body.coverImage = files.cover[0].path;

  // ── If external URL provided and no file uploaded, keep fileUrl from body ──
  // (body.fileUrl already set from form if isExternal === true)

  // ── Parse JSON arrays ──
  if (typeof body.classes === 'string') {
    try { body.classes = JSON.parse(body.classes); } catch { body.classes = []; }
  }
  if (typeof body.tags === 'string') {
    try { body.tags = JSON.parse(body.tags); } catch { body.tags = []; }
  }

  // ── Parse booleans ──
  ['isForKids', 'isFeatured', 'isPublished', 'isExternal'].forEach(k => {
    if (typeof body[k] === 'string') body[k] = body[k] === 'true';
  });

  // ── Parse numbers ──
  ['ageMin', 'ageMax'].forEach(k => {
    if (body[k] !== undefined) body[k] = Number(body[k]);
  });

  // ── Strip empty fileUrl string so validation fails clearly ──
  if (!body.fileUrl || body.fileUrl.trim() === '') delete body.fileUrl;

  return body;
}

exports.createMaterial = async (req, res) => {
  try {
    const body = parseBody({ ...req.body }, req.files);

    // ── Debug log — check terminal when upload fails ──
    console.log('📦 createMaterial body:', JSON.stringify({
      title:       body.title,
      type:        body.type,
      format:      body.format,
      subject:     body.subject,
      language:    body.language,
      classes:     body.classes,
      isExternal:  body.isExternal,
      fileUrl:     body.fileUrl,
      coverImage:  body.coverImage,
      isPublished: body.isPublished,
    }, null, 2));

    const mat = await Material.create(body);
    res.status(201).json({ success: true, data: mat });
  } catch (err) {
    console.error('❌ createMaterial error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const body = parseBody({ ...req.body }, req.files);

    console.log('📦 updateMaterial body:', JSON.stringify({
      title:       body.title,
      type:        body.type,
      format:      body.format,
      subject:     body.subject,
      language:    body.language,
      classes:     body.classes,
      isExternal:  body.isExternal,
      fileUrl:     body.fileUrl,
      coverImage:  body.coverImage,
      isPublished: body.isPublished,
    }, null, 2));

    const mat = await Material.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!mat) return res.status(404).json({ success: false, message: 'Haipo.' });
    res.json({ success: true, data: mat });
  } catch (err) {
    console.error('❌ updateMaterial error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const mat = await Material.findByIdAndDelete(req.params.id);
    if (!mat) return res.status(404).json({ success: false, message: 'Haipo.' });
    res.json({ success: true, message: 'Imefutwa.' });
  } catch (err) {
    console.error('❌ deleteMaterial:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminGetMaterials = async (req, res) => {
  try {
    const { subject, type, isPublished, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (subject)                   filter.subject = subject;
    if (type)                      filter.type = type;
    if (isPublished !== undefined)  filter.isPublished = isPublished === 'true';
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Material.countDocuments(filter);
    const items = await Material.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    res.json({ success: true, data: items, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error('❌ adminGetMaterials:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminStats = async (req, res) => {
  try {
    const [total, published, kids] = await Promise.all([
      Material.countDocuments(),
      Material.countDocuments({ isPublished: true }),
      Material.countDocuments({ isPublished: true, isForKids: true }),
    ]);
    const bySubject = await Material.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$subject', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: { total, published, kids, bySubject } });
  } catch (err) {
    console.error('❌ adminStats:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};