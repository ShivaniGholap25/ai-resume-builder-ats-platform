// ============================================================
// services/textExtractor.js
// Extracts plain text from PDF and DOCX file buffers.
//
// Why a separate service?
//   The existing resumeParser.js is tightly coupled to the ATS
//   analysis flow. This module is a clean, standalone extractor
//   that only does one thing — text extraction — making it easy
//   to reuse across any route.
// ============================================================

const pdfParse = require('pdf-parse');   // Parses PDF binary → plain text
const mammoth  = require('mammoth');     // Converts DOCX → plain text

// ── MIME types we support ─────────────────────────────────────
const MIME_PDF  = 'application/pdf';
const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * extractText
 * -----------
 * Converts a file buffer to plain text.
 *
 * @param {Buffer} buffer   - Raw file bytes (from multer memoryStorage)
 * @param {string} mimetype - MIME type of the uploaded file
 * @param {string} filename - Original file name (used for error messages)
 *
 * @returns {Promise<{
 *   text:      string,   // Extracted plain text
 *   pageCount: number,   // Number of pages (PDF only, else 1)
 *   wordCount: number,   // Approximate word count
 *   charCount: number,   // Total character count
 * }>}
 *
 * @throws {Error} if the file type is unsupported or parsing fails
 */
const extractText = async (buffer, mimetype, filename = 'file') => {
  let rawText = '';
  let pageCount = 1;

  // ── PDF extraction ────────────────────────────────────────
  if (mimetype === MIME_PDF) {
    try {
      const parsed = await pdfParse(buffer);
      rawText    = parsed.text || '';
      pageCount  = parsed.numpages || 1;
    } catch (err) {
      throw new Error(
        `Could not parse PDF "${filename}". ` +
        'Make sure it is a text-based PDF, not a scanned image. ' +
        `(${err.message})`
      );
    }
  }

  // ── DOCX extraction ───────────────────────────────────────
  else if (mimetype === MIME_DOCX) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || '';
      // mammoth doesn't give page count; estimate 1 page per ~500 words
      pageCount = Math.max(1, Math.ceil(rawText.split(/\s+/).length / 500));
    } catch (err) {
      throw new Error(
        `Could not parse DOCX "${filename}". ` +
        `Make sure it is a valid Word document. (${err.message})`
      );
    }
  }

  // ── Unsupported type ──────────────────────────────────────
  else {
    throw new Error(
      `Unsupported file type: "${mimetype}". ` +
      'Please upload a PDF (.pdf) or Word document (.docx).'
    );
  }

  // ── Clean the extracted text ──────────────────────────────
  //    • Collapse 3+ blank lines into a single blank line
  //    • Trim leading/trailing whitespace
  const cleanText = rawText
    .replace(/\r\n/g, '\n')             // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')         // Collapse excessive blank lines
    .replace(/[^\S\n]{2,}/g, ' ')       // Collapse multiple spaces (not newlines)
    .trim();

  // ── Basic stats ───────────────────────────────────────────
  const words = cleanText.split(/\s+/).filter(Boolean);

  return {
    text:      cleanText,
    pageCount,
    wordCount: words.length,
    charCount: cleanText.length,
  };
};

module.exports = { extractText };
