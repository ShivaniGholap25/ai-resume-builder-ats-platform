// ============================================================
// components/dashboard/UploadForm.jsx — File upload + JD input
// ============================================================

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * UploadForm — drag-and-drop file upload with optional JD textarea.
 *
 * Props:
 *   onSubmit  {function(file, jobDescription)} — called on form submit
 *   isLoading {boolean}
 */
const UploadForm = ({ onSubmit, isLoading }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  // Handle dropped / selected files
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Only PDF and DOCX files are accepted (max 5 MB).');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a resume file first.');
      return;
    }
    onSubmit(file, jobDescription);
  };

  const removeFile = () => setFile(null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📄</span>
            <p className="font-semibold text-green-700">{file.name}</p>
            <p className="text-sm text-slate-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl">📂</span>
            <p className="text-slate-600 font-medium">
              {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume here'}
            </p>
            <p className="text-sm text-slate-400">or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF and DOCX • Max 5 MB</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Job Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Job Description <span className="font-normal text-slate-400">(optional — enables keyword matching)</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to get keyword match analysis and tailored suggestions..."
          rows={5}
          className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !file}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white text-base transition-all duration-200 ${
          isLoading || !file
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-200 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analyzing Resume...
          </span>
        ) : (
          '🔍 Analyze Resume'
        )}
      </button>
    </form>
  );
};

export default UploadForm;
