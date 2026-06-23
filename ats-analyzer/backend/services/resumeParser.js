// ============================================================
// services/resumeParser.js — Extract text from PDF / DOCX
// ============================================================

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract plain text from an uploaded file buffer.
 * Supports PDF and DOCX formats.
 *
 * @param {Buffer} buffer   - File buffer from multer memoryStorage
 * @param {string} mimetype - MIME type of the uploaded file
 * @returns {Promise<string>} Extracted plain text
 */
const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type');
};

module.exports = { extractText };
