// ============================================================
// middleware/resumeUpload.js
// Multer configuration specifically for the /api/resume/upload
// endpoint. Kept separate from the general upload.js so each
// route can have its own size limits and file type rules.
// ============================================================

const multer = require('multer');

// ── Store the file in memory (Buffer), not on disk ───────────
//    This is safer for serverless / cloud deployments and means
//    we never leave temp files on the filesystem.
const storage = multer.memoryStorage();

// ── Only accept PDF and DOCX files ───────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true); // ✅ Accept
  } else {
    // ❌ Reject — multer will set req.fileValidationError
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        'Only PDF (.pdf) and Word (.docx) files are supported.'
      ),
      false
    );
  }
};

// ── Build the multer instance ─────────────────────────────────
const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:  10 * 1024 * 1024, // 10 MB max
    files:     1,                // Only 1 file per request
  },
});

module.exports = resumeUpload;
