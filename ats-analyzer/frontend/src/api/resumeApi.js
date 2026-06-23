// ============================================================
// api/resumeApi.js
// Handles the POST /api/resume/upload call with upload progress.
//
// Why Axios?
//   Axios supports an onUploadProgress callback that lets us
//   show a real progress bar to the user while the file is
//   being sent to the server.
// ============================================================

import axios from 'axios';

// Base URL — same Express server as the rest of the app
const BASE = 'http://localhost:5000/api/resume';

/**
 * uploadResume
 * ------------
 * Uploads a PDF or DOCX file and receives extracted text.
 *
 * @param {File}     file             - The file object from the input / dropzone
 * @param {Function} onProgress       - Called with a number 0-100 during upload
 *                                      e.g. (pct) => setProgress(pct)
 *
 * @returns {Promise<{
 *   success:     boolean,
 *   fileName:    string,
 *   fileType:    string,   // "PDF" | "DOCX"
 *   fileSize:    number,   // bytes
 *   text:        string,   // extracted plain text
 *   pageCount:   number,
 *   wordCount:   number,
 *   charCount:   number,
 *   extractedAt: string,   // ISO date string
 * }>}
 */
export const uploadResume = async (file, onProgress = () => {}) => {
  // Build a FormData object — required for multipart/form-data
  const formData = new FormData();
  formData.append('resume', file);  // Field name must match multer config

  const response = await axios.post(`${BASE}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // This callback fires as bytes are sent over the network
    onUploadProgress: (event) => {
      if (event.total) {
        // Calculate percentage complete
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    },
  });

  return response.data;
};

/**
 * checkHealth
 * -----------
 * Pings the resume upload service to confirm it is running.
 * Useful for showing a "server offline" message.
 */
export const checkHealth = async () => {
  const response = await axios.get(`${BASE}/health`);
  return response.data;
};
