// ============================================================
// routes/resumeRoutes.js
// Handles resume file upload and text extraction.
//
// Endpoints:
//   POST /api/resume/upload  — Upload file, extract text, return JSON
//   GET  /api/resume/health  — Simple health check for this router
// ============================================================

const express      = require('express');
const router       = express.Router();
const resumeUpload = require('../middleware/resumeUpload');
const { extractText } = require('../services/textExtractor');

// ── Supported file extensions (for display only) ─────────────
const EXT_MAP = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

// ============================================================
// POST /api/resume/upload
// ============================================================
//
// Request  : multipart/form-data   →  field name: "resume"
//
// Success response (200):
// {
//   success:      true,
//   fileName:     "john_doe_resume.pdf",
//   fileType:     "PDF",
//   fileSize:     48230,           // bytes
//   text:         "John Doe\n...", // extracted plain text
//   pageCount:    2,
//   wordCount:    412,
//   charCount:    2840,
//   extractedAt:  "2025-06-01T10:23:00.000Z"
// }
//
// Error responses:
//   400  — No file / wrong field name
//   413  — File too large (> 10 MB)
//   415  — Unsupported file type
//   422  — File parsed but no readable text found (scanned image)
//   500  — Unexpected server error
// ============================================================

router.post(
  '/upload',

  // Step 1: Run multer middleware — handles file validation & storage
  (req, res, next) => {
    resumeUpload.single('resume')(req, res, (err) => {
      // Handle multer-specific errors with clear messages
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'File is too large. Maximum allowed size is 10 MB.',
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(415).json({
            error: 'Unsupported file type. Please upload a PDF or DOCX file.',
          });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },

  // Step 2: Validate that a file was actually sent
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error:   'No file uploaded.',
        details: 'Send the file as multipart/form-data with the field name "resume".',
      });
    }
    next();
  },

  // Step 3: Extract text from the file buffer
  async (req, res) => {
    const { buffer, mimetype, originalname, size } = req.file;

    try {
      // Call our text extraction service
      const { text, pageCount, wordCount, charCount } = await extractText(
        buffer,
        mimetype,
        originalname
      );

      // Make sure we actually got readable text
      if (!text || text.trim().length < 20) {
        return res.status(422).json({
          error:   'Could not extract readable text from this file.',
          details:
            'The file may be a scanned image PDF. Please use a text-based PDF ' +
            'or convert your resume to DOCX format.',
        });
      }

      // All good — return the extracted content
      return res.status(200).json({
        success:     true,
        fileName:    originalname,
        fileType:    EXT_MAP[mimetype] || 'Unknown',
        fileSize:    size,
        text,
        pageCount,
        wordCount,
        charCount,
        extractedAt: new Date().toISOString(),
      });

    } catch (extractError) {
      // Text extraction failed (e.g. corrupted file)
      console.error('Text extraction error:', extractError.message);

      return res.status(422).json({
        error:   'Failed to extract text from the uploaded file.',
        details: extractError.message,
      });
    }
  }
);

// ============================================================
// GET /api/resume/health
// Quick sanity-check — useful for testing without uploading
// ============================================================
router.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'resume-upload',
    timestamp: new Date().toISOString(),
    accepts:   ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSizeMB: 10,
  });
});

module.exports = router;
