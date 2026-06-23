// ============================================================
// components/ats-analyzer/DropZone.jsx
//
// Drag-and-drop file upload area.
// Accepts PDF and DOCX files up to 10 MB.
//
// Props:
//   onFileSelect  {function(File)} — called when a valid file is chosen
//   disabled      {boolean}        — disables interaction while uploading
// ============================================================

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

// ── File size formatter ───────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── File type icon ────────────────────────────────────────────
const FileIcon = ({ type }) => (
  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-md ${
    type === 'pdf' ? 'bg-rose-500' : 'bg-blue-500'
  }`}>
    {type === 'pdf' ? 'P' : 'W'}
  </div>
);

export default function DropZone({ onFileSelect, disabled = false }) {
  // Track the selected file locally for display
  const [selectedFile, setSelectedFile] = useState(null);
  // Track drag-rejection error message
  const [dropError,    setDropError]    = useState('');

  // ── Handle file drop / selection ─────────────────────────
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setDropError('');

      // Handle rejected files (wrong type or too large)
      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0];
        if (reason.code === 'file-too-large') {
          setDropError('File is too large. Maximum size is 10 MB.');
        } else if (reason.code === 'file-invalid-type') {
          setDropError('Invalid file type. Please upload a PDF or DOCX file.');
        } else {
          setDropError(reason.message);
        }
        return;
      }

      // Accept the first valid file
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file); // Notify the parent component
      }
    },
    [onFileSelect]
  );

  // ── Configure react-dropzone ──────────────────────────────
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled,
    maxFiles:  1,
    maxSize:   10 * 1024 * 1024, // 10 MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  // Remove the selected file and reset state
  const handleRemove = (e) => {
    e.stopPropagation(); // Prevent the drop zone from opening the file picker
    setSelectedFile(null);
    setDropError('');
    onFileSelect(null);  // Tell parent the file was cleared
  };

  // ── Determine drop zone border colour ────────────────────
  const borderClass =
    isDragReject  ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'  :
    isDragActive  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' :
    selectedFile  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' :
    disabled      ? 'border-slate-200 bg-slate-50 dark:bg-slate-800 opacity-60 cursor-not-allowed' :
                    'border-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer';

  const fileExt = selectedFile?.name.split('.').pop().toLowerCase();

  return (
    <div className="w-full">
      {/* ── Drop area ──────────────────────────────────────── */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${borderClass}`}
      >
        {/* Hidden native file input */}
        <input {...getInputProps()} />

        <div className="p-8 flex flex-col items-center justify-center text-center min-h-[200px]">

          <AnimatePresence mode="wait">
            {selectedFile ? (
              /* ── File selected state ──────────────────────── */
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <FileIcon type={fileExt} />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatBytes(selectedFile.size)}
                    {' · '}
                    {fileExt?.toUpperCase()}
                  </p>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="mt-1 text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 underline underline-offset-2 transition-colors"
                  >
                    Remove file
                  </button>
                )}
              </motion.div>

            ) : isDragActive ? (
              /* ── Dragging over state ──────────────────────── */
              <motion.div
                key="dragging"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-5xl"
                >
                  📂
                </motion.div>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Drop your resume here!
                </p>
              </motion.div>

            ) : (
              /* ── Default idle state ───────────────────────── */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-3xl">
                  📄
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-base">
                    Drag & drop your resume here
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    or{' '}
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2">
                      click to browse
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {/* Supported formats badges */}
                  {['PDF', 'DOCX'].map(fmt => (
                    <span key={fmt} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                      .{fmt.toLowerCase()}
                    </span>
                  ))}
                  <span className="text-xs text-slate-400 dark:text-slate-500">Max 10 MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Validation error message ───────────────────────── */}
      <AnimatePresence>
        {dropError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 flex items-start gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl"
          >
            <span className="text-rose-500 shrink-0 mt-0.5">⚠️</span>
            <p className="text-sm text-rose-700 dark:text-rose-400">{dropError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
