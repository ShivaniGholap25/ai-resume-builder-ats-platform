// ============================================================
// middleware/upload.js — Multer config for file uploads
// ============================================================

const multer = require('multer');
const path = require('path');

// Store files in memory (no disk write needed — we parse in-memory)
const storage = multer.memoryStorage();

// Only allow PDF and DOCX files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;
