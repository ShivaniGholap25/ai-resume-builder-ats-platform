// ============================================================
// components/ats-analyzer/ATSAnalyzerPage.jsx
//
// The main ATS Analyzer page.
// Orchestrates:
//   1. File selection (DropZone)
//   2. Upload with progress (UploadProgress)
//   3. Text preview (ExtractedTextPanel)
//   4. Error display (ErrorBanner)
//
// State machine:
//   idle → uploading → extracting → done
//                   ↘ error
// ============================================================

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

import DropZone            from './DropZone';
import UploadProgress      from './UploadProgress';
import ExtractedTextPanel  from './ExtractedTextPanel';
import ErrorBanner         from './ErrorBanner';
import { uploadResume }    from '../../api/resumeApi';

// Upload state labels
const STATES = {
  IDLE:       'idle',
  UPLOADING:  'uploading',
  EXTRACTING: 'extracting',
  DONE:       'done',
  ERROR:      'error',
};

// ── Feature highlight cards shown on the landing state ───────
const FEATURES = [
  { icon: '📤', title: 'Upload Resume',    desc: 'PDF or DOCX, up to 10 MB'            },
  { icon: '🔍', title: 'Extract Text',     desc: 'Machine-readable text extraction'    },
  { icon: '📊', title: 'Word Count',       desc: 'Page, word, and character stats'     },
  { icon: '🔎', title: 'Search Text',      desc: 'Find keywords in your resume instantly' },
];

export default function ATSAnalyzerPage() {
  // ── Component state ───────────────────────────────────────
  const [uploadState, setUploadState] = useState(STATES.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractResult, setExtractResult] = useState(null);
  const [errorInfo, setErrorInfo] = useState({ message: '', details: '' });

  // ── Handle file selection from DropZone ───────────────────
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    // Reset any previous result when a new file is chosen
    if (file === null) {
      setUploadState(STATES.IDLE);
      setExtractResult(null);
      setErrorInfo({ message: '', details: '' });
    }
  }, []);

  // ── Handle the upload button click ───────────────────────
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a resume file first.');
      return;
    }

    // Reset state
    setUploadState(STATES.UPLOADING);
    setUploadProgress(0);
    setExtractResult(null);
    setErrorInfo({ message: '', details: '' });

    try {
      // Step 1: Upload file to server (with real progress tracking)
      const result = await uploadResume(selectedFile, (pct) => {
        setUploadProgress(pct);

        // Once upload reaches 100%, the server starts extracting text
        // Show "extracting" state to keep the user informed
        if (pct >= 100) {
          setUploadState(STATES.EXTRACTING);
        }
      });

      // Step 2: Upload + extraction succeeded
      setExtractResult(result);
      setUploadState(STATES.DONE);
      toast.success(`Extracted ${result.wordCount.toLocaleString()} words from ${result.fileName}`);

    } catch (err) {
      // Extract the most useful error message from the axios error
      const serverError  = err.response?.data?.error   || '';
      const serverDetail = err.response?.data?.details  || '';
      const networkError = err.message                  || 'Unknown error';

      setErrorInfo({
        message: serverError || networkError,
        details: serverDetail,
      });
      setUploadState(STATES.ERROR);
      toast.error('Upload failed — see details below.');
    }
  };

  // ── Reset everything to the initial state ─────────────────
  const handleReset = () => {
    setUploadState(STATES.IDLE);
    setSelectedFile(null);
    setUploadProgress(0);
    setExtractResult(null);
    setErrorInfo({ message: '', details: '' });
  };

  // ── Derived booleans ──────────────────────────────────────
  const isUploading   = uploadState === STATES.UPLOADING;
  const isExtracting  = uploadState === STATES.EXTRACTING;
  const isBusy        = isUploading || isExtracting;
  const isDone        = uploadState === STATES.DONE;
  const isError       = uploadState === STATES.ERROR;
  const isIdle        = uploadState === STATES.IDLE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
            📄
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Resume Parser & Text Extraction
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-md mx-auto">
            Upload your resume to extract its text content. Supports PDF and DOCX formats.
          </p>
        </motion.div>

        {/* ── Feature cards (only on idle state) ─────────────── */}
        <AnimatePresence>
          {isIdle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-sm"
                >
                  <p className="text-2xl mb-2">{f.icon}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{f.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main upload card ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Upload Resume
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Drag and drop your file below, or click to browse.
                </p>
              </div>

              {/* Drop zone — disabled while uploading */}
              <DropZone onFileSelect={handleFileSelect} disabled={isBusy} />

              {/* Progress bar — shown while uploading or extracting */}
              <AnimatePresence>
                {isBusy && (
                  <UploadProgress
                    progress={uploadProgress}
                    fileName={selectedFile?.name || ''}
                    status={isExtracting ? 'extracting' : 'uploading'}
                  />
                )}
              </AnimatePresence>

              {/* Error banner */}
              <AnimatePresence>
                {isError && (
                  <ErrorBanner
                    message={errorInfo.message}
                    details={errorInfo.details}
                    onRetry={handleReset}
                  />
                )}
              </AnimatePresence>

              {/* Upload button */}
              {!isBusy && (
                <motion.button
                  onClick={handleUpload}
                  disabled={!selectedFile || isBusy}
                  whileHover={selectedFile && !isBusy ? { scale: 1.01 } : {}}
                  whileTap={selectedFile && !isBusy ? { scale: 0.99 } : {}}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all ${
                    !selectedFile
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40'
                  }`}
                >
                  {selectedFile
                    ? `⬆️ Extract Text from "${selectedFile.name}"`
                    : 'Select a file to continue'}
                </motion.button>
              )}

              {/* Supported formats note */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Supported: <strong>.pdf</strong> · <strong>.docx</strong> · Max 10 MB
              </p>
            </motion.div>

          ) : (
            /* ── Results panel ─────────────────────────────────── */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ExtractedTextPanel
                result={extractResult}
                onClear={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
