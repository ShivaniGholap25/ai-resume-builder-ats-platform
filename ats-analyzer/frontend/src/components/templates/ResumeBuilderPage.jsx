// ============================================================
// ResumeBuilderPage.jsx — Full resume builder with live preview
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_RESUME, TEMPLATES, THEMES, FONTS } from '../../data/resumeDefaults';
import { TEMPLATE_COMPONENTS } from './templateRegistry';
import ResumeEditor   from './ResumeEditor';
import TemplatePicker from './TemplatePicker';
import { usePDFExport } from '../../hooks/usePDFExport';

// ── Panel tabs for left sidebar ───────────────────────────────
const EDITOR_TABS = [
  { id: 'template', label: 'Design',  icon: '🎨' },
  { id: 'content',  label: 'Content', icon: '✏️' },
];

export default function ResumeBuilderPage() {
  // ── State ─────────────────────────────────────────────────
  const [data,         setData]         = useState({ ...DEFAULT_RESUME });
  const [templateId,   setTemplateId]   = useState('classic');
  const [themeId,      setThemeId]      = useState('blue');
  const [fontId,       setFontId]       = useState('arial');
  const [fontSize,     setFontSize]     = useState(10);
  const [editorTab,    setEditorTab]    = useState('content');
  const [previewScale, setPreviewScale] = useState(0.6);
  const [showGuide,    setShowGuide]    = useState(false);

  const { exportPDF, exporting } = usePDFExport();
  const previewRef = useRef(null);

  // ── Derived values ────────────────────────────────────────
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS.classic;
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const font  = FONTS.find(f => f.id === fontId)   || FONTS[0];
  const templateMeta = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

  const handleExport = () => exportPDF('resume-preview', `${data.name || 'resume'}_${templateId}`);

  const handleReset = () => {
    if (confirm('Reset all content to the default sample resume?')) {
      setData({ ...DEFAULT_RESUME });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900">
      {/* ── Top toolbar ──────────────────────────────────────── */}
      <div className="sticky top-[56px] z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              R
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                Resume Builder
              </h1>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${templateMeta.badgeColor}`}>
                  {templateMeta.name}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ATS {templateMeta.atsScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Preview zoom */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
            <button onClick={() => setPreviewScale(s => Math.max(0.35, s - 0.05))}
              className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm rounded">−</button>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-10 text-center">{Math.round(previewScale * 100)}%</span>
            <button onClick={() => setPreviewScale(s => Math.min(1.0, s + 0.05))}
              className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm rounded">+</button>
            <button onClick={() => setPreviewScale(0.6)}
              className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 ml-1 font-medium">Fit</button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowGuide(g => !g)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              📋 ATS Guide
            </button>
            <button
              onClick={handleReset}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              ↺ Reset
            </button>
            <motion.button
              onClick={handleExport}
              disabled={exporting}
              whileHover={!exporting ? { scale: 1.02 } : {}}
              whileTap={!exporting ? { scale: 0.98 } : {}}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all shadow-lg ${
                exporting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-200 dark:shadow-indigo-900/40'
              }`}
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Generating…
                </>
              ) : (
                <>⬇ Download PDF</>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── ATS Guide overlay ────────────────────────────────── */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800"
          >
            <div className="max-w-[1600px] mx-auto px-6 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✅</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">ATS Optimization Guidelines</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-1 text-xs text-emerald-700 dark:text-emerald-400">
                      {[
                        'Single-column layout — no tables or text boxes',
                        'Standard section headings (Experience, Education, Skills)',
                        'ATS-safe fonts: Arial, Calibri, Georgia, Verdana',
                        'No images, logos, charts, or infographics',
                        'Dates in consistent format (MMM YYYY)',
                        'Bullet points with strong action verbs',
                        'Include email, phone, and LinkedIn URL',
                        'Export as .docx or single-layer PDF',
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="shrink-0 mt-0.5">•</span>{tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowGuide(false)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 shrink-0 text-lg">×</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main 3-column layout ─────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto flex h-[calc(100vh-56px-57px)] overflow-hidden">

        {/* ── LEFT: Design + Content editor ──────────────────── */}
        <div className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
            {EDITOR_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setEditorTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  editorTab === tab.id
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable panel */}
          <div className="flex-1 overflow-y-auto p-3">
            <AnimatePresence mode="wait">
              {editorTab === 'template' ? (
                <motion.div key="template" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <TemplatePicker
                    selectedTemplate={templateId}
                    selectedTheme={themeId}
                    selectedFont={fontId}
                    fontSize={fontSize}
                    onTemplate={setTemplateId}
                    onTheme={setThemeId}
                    onFont={setFontId}
                    onFontSize={setFontSize}
                  />
                </motion.div>
              ) : (
                <motion.div key="content" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <ResumeEditor data={data} onChange={setData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: Live preview ─────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 flex flex-col items-center py-8 px-4">
          {/* Preview label */}
          <div className="mb-4 flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live Preview</span>
            <span className="h-px w-16 bg-slate-300 dark:bg-slate-600" />
            <span className="text-xs text-slate-400 dark:text-slate-500">A4 · {templateMeta.name} · {font.name}</span>
          </div>

          {/* Scaled preview wrapper */}
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              // Keep the wrapper height in sync with scaled content
              marginBottom: `calc((297mm * ${previewScale} - 297mm) * 0.5)`,
            }}
          >
            <div className="shadow-2xl shadow-slate-400/30 dark:shadow-slate-900/60">
              <TemplateComponent
                ref={previewRef}
                data={data}
                theme={theme}
                font={font}
                fontSize={fontSize}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
