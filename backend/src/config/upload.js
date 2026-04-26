const multer = require('multer');
const cloudinaryV2 = require('cloudinary').v2;
const streamifier = require('streamifier');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// ─── Cloudinary — explicit config, nothing from env leaks in ─────────────────
// We configure it here directly instead of importing from ./cloudinary
// to ensure ONLY these 3 keys are passed — no language, no other overrides.

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ─── Ghostscript path ─────────────────────────────────────────────────────────

const GS_CMD = process.platform === 'win32'
  ? 'C:\\Program Files\\gs\\gs10.07.0\\bin\\gswin64c.exe'
  : 'gs';

// ─── Supabase client (PDFs and EPUBs only) ────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'books';

// ─── Book mimetypes → Supabase. Everything else → Cloudinary ─────────────────

const BOOK_TYPES = ['application/pdf', 'application/epub+zip'];

// ─── Cloudinary folder/resource_type map ─────────────────────────────────────

function getCloudinaryParams(mimetype) {
  if (mimetype.startsWith('image/'))  return { folder: 'maktabahuru/covers', resource_type: 'image' };
  if (mimetype.startsWith('video/'))  return { folder: 'maktabahuru/videos', resource_type: 'video' };
  if (mimetype.startsWith('audio/'))  return { folder: 'maktabahuru/audio',  resource_type: 'video' };
  return                                     { folder: 'maktabahuru/misc',   resource_type: 'raw'   };
}

const LARGE_FILE_THRESHOLD = 8 * 1024 * 1024;
const CHUNK_SIZE            = 8 * 1024 * 1024;
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '200', 10);

// ─── PDF Compression ──────────────────────────────────────────────────────────

async function compressPDF(inputBuffer) {
  const tmpIn  = path.join(os.tmpdir(), `pdf_in_${Date.now()}.pdf`);
  const tmpOut = path.join(os.tmpdir(), `pdf_out_${Date.now()}.pdf`);

  try {
    await fs.promises.writeFile(tmpIn, inputBuffer);

    await execFileAsync(GS_CMD, [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/screen',
      '-dNOPAUSE',
      '-dBATCH',
      '-dQUIET',
      '-dColorImageResolution=72',
      '-dGrayImageResolution=72',
      '-dMonoImageResolution=72',
      '-dColorImageDownsampleType=/Bicubic',
      '-dGrayImageDownsampleType=/Bicubic',
      '-dMonoImageDownsampleType=/Bicubic',
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dDownsampleMonoImages=true',
      `-sOutputFile=${tmpOut}`,
      tmpIn,
    ]);

    const compressedBuffer = await fs.promises.readFile(tmpOut);
    const originalMB   = (inputBuffer.length     / 1024 / 1024).toFixed(2);
    const compressedMB = (compressedBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`✅ PDF compressed: ${originalMB}MB → ${compressedMB}MB`);

    return compressedBuffer.length < inputBuffer.length ? compressedBuffer : inputBuffer;
  } catch (err) {
    console.error('❌ Ghostscript compression failed:', err.message);
    return inputBuffer;
  } finally {
    await fs.promises.unlink(tmpIn).catch(() => {});
    await fs.promises.unlink(tmpOut).catch(() => {});
  }
}

// ─── Supabase upload (PDFs and EPUBs) ────────────────────────────────────────

async function uploadToSupabase(file) {
  let { buffer, mimetype, originalname } = file;

  if (mimetype === 'application/pdf') {
    buffer = await compressPDF(buffer);
  }

  const ext      = path.extname(originalname) || (mimetype === 'application/pdf' ? '.pdf' : '.epub');
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filename, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(data.path);

  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(`✅ Book uploaded to Supabase: ${filename} (${sizeMB}MB)`);

  return {
    secure_url: urlData.publicUrl,
    public_id:  data.path,
    provider:   'supabase',
  };
}

// ─── File filter ──────────────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  'application/pdf', 'application/epub+zip',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/ogg', 'audio/wav',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type not allowed: ${file.mimetype}`), false);
};

// ─── Multer memory instance ───────────────────────────────────────────────────

const multerMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
});

// ─── Cloudinary upload helpers ────────────────────────────────────────────────
// Options are built explicitly — req.body is NEVER spread here.

function uploadStream(buffer, params) {
  return new Promise((resolve, reject) => {
    // Whitelist ONLY the fields Cloudinary accepts — nothing from req.body
    const options = {
      folder:          params.folder,
      resource_type:   params.resource_type,
      use_filename:    false,
      unique_filename: true,
    };
    const stream = cloudinaryV2.uploader.upload_stream(
      options,
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

function uploadLarge(buffer, params) {
  return new Promise((resolve, reject) => {
    const tmpPath = path.join(os.tmpdir(), `cld_upload_${Date.now()}`);

    fs.writeFile(tmpPath, buffer, (writeErr) => {
      if (writeErr) return reject(writeErr);

      // Whitelist ONLY the fields Cloudinary accepts — nothing from req.body
      const options = {
        folder:          params.folder,
        resource_type:   params.resource_type,
        chunk_size:      CHUNK_SIZE,
        use_filename:    false,
        unique_filename: true,
      };

      cloudinaryV2.uploader.upload_large(tmpPath, options, (error, result) => {
        fs.unlink(tmpPath, () => {});
        if (error) reject(error);
        else resolve(result);
      });
    });
  });
}

function uploadToCloudinary(file) {
  const { buffer, mimetype } = file;
  const params = getCloudinaryParams(mimetype);

  return buffer.length > LARGE_FILE_THRESHOLD
    ? uploadLarge(buffer, params)
    : uploadStream(buffer, params);
}

// ─── Core upload router ───────────────────────────────────────────────────────

async function uploadFile(file) {
  if (BOOK_TYPES.includes(file.mimetype)) {
    return await uploadToSupabase(file);
  }
  return await uploadToCloudinary(file);
}

function applyResult(file, result) {
  file.path       = result.secure_url;
  file.filename   = result.public_id;
  file.cloudinary = result; // kept for backwards compat
}

// ─── Middleware exports ───────────────────────────────────────────────────────

module.exports = {
  single: (fieldName) => (req, res, next) => {
    multerMemory.single(fieldName)(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();
      try {
        const result = await uploadFile(req.file);
        applyResult(req.file, result);
        next();
      } catch (e) { next(e); }
    });
  },

  fields: (fieldsArray) => (req, res, next) => {
    multerMemory.fields(fieldsArray)(req, res, async (err) => {
      if (err) return next(err);
      if (!req.files) return next();
      try {
        const allFiles = Object.values(req.files).flat();
        await Promise.all(allFiles.map(async (file) => {
          const result = await uploadFile(file);
          applyResult(file, result);
        }));
        next();
      } catch (e) { next(e); }
    });
  },

  array: (fieldName, maxCount) => (req, res, next) => {
    multerMemory.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) return next(err);
      if (!req.files?.length) return next();
      try {
        await Promise.all(req.files.map(async (file) => {
          const result = await uploadFile(file);
          applyResult(file, result);
        }));
        next();
      } catch (e) { next(e); }
    });
  },
};