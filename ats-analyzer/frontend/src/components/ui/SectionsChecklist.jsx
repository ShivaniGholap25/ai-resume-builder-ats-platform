// ============================================================
// components/ui/SectionsChecklist.jsx — Resume sections status
// ============================================================

const sectionLabels = {
  contact:         'Contact Information',
  summary:         'Professional Summary',
  experience:      'Work Experience',
  education:       'Education',
  skills:          'Skills',
  projects:        'Projects',
  certifications:  'Certifications',
  achievements:    'Achievements / Awards',
};

const SectionsChecklist = ({ sectionsFound = {} }) => {
  const entries = Object.entries(sectionLabels);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-slide-up">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Sections Detected</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entries.map(([key, label]) => {
          const found = sectionsFound[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                found
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-base">{found ? '✅' : '⬜'}</span>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionsChecklist;
