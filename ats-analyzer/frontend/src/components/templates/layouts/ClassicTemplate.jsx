// ============================================================
// ClassicTemplate.jsx — Clean single-column, max ATS safety
// ============================================================

import { forwardRef } from 'react';

const ClassicTemplate = forwardRef(({ data, theme, font, fontSize = 10 }, ref) => {
  const { accent, text } = theme;
  const ff = font.css;
  const fs = `${fontSize}pt`;

  const sectionTitle = {
    fontFamily: ff,
    fontSize:   `${fontSize + 1}pt`,
    fontWeight: 'bold',
    color:      accent,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: `2px solid ${accent}`,
    paddingBottom: '3px',
    marginBottom:  '8px',
    marginTop:     '14px',
  };

  const baseText = { fontFamily: ff, fontSize: fs, color: text, lineHeight: 1.5 };

  return (
    <div
      ref={ref}
      id="resume-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '18mm 20mm',
        background: '#ffffff',
        fontFamily: ff,
        fontSize: fs,
        color: text,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: `3px solid ${accent}`, paddingBottom: '12px' }}>
        <h1 style={{ fontFamily: ff, fontSize: `${fontSize + 10}pt`, fontWeight: 'bold', color: accent, margin: 0, letterSpacing: '0.04em' }}>
          {data.name}
        </h1>
        {data.title && (
          <p style={{ fontFamily: ff, fontSize: `${fontSize + 1}pt`, color: '#555', margin: '4px 0 0' }}>
            {data.title}
          </p>
        )}
        <div style={{ marginTop: '6px', fontSize: `${fontSize - 0.5}pt`, color: '#444', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {data.email    && <span>{data.email}</span>}
          {data.phone    && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github   && <span>{data.github}</span>}
        </div>
      </div>

      {/* ── Summary ────────────────────────────────────────── */}
      {data.summary && (
        <div>
          <h2 style={sectionTitle}>Professional Summary</h2>
          <p style={{ ...baseText, margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {/* ── Experience ─────────────────────────────────────── */}
      {data.experience?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Work Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: text }}>{exp.title}</strong>
                <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#666' }}>{exp.start} – {exp.end}</span>
              </div>
              <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#555', marginBottom: '4px' }}>
                {exp.company}{exp.location ? ` • ${exp.location}` : ''}
              </div>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {exp.bullets?.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ ...baseText, marginBottom: '2px' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Education ──────────────────────────────────────── */}
      {data.education?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: text }}>{edu.degree}</strong>
                <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#666' }}>{edu.start} – {edu.end}</span>
              </div>
              <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#555' }}>
                {edu.institution}{edu.location ? ` • ${edu.location}` : ''}
                {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                {edu.honors ? ` • ${edu.honors}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ─────────────────────────────────────────── */}
      {(data.skills?.technical?.length > 0 || data.skills?.tools?.length > 0) && (
        <div>
          <h2 style={sectionTitle}>Skills</h2>
          {data.skills.technical?.length > 0 && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontFamily: ff, fontSize: fs, fontWeight: 'bold', color: text }}>Technical: </span>
              <span style={{ fontFamily: ff, fontSize: fs, color: '#444' }}>{data.skills.technical.join(' • ')}</span>
            </div>
          )}
          {data.skills.tools?.length > 0 && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontFamily: ff, fontSize: fs, fontWeight: 'bold', color: text }}>Tools: </span>
              <span style={{ fontFamily: ff, fontSize: fs, color: '#444' }}>{data.skills.tools.join(' • ')}</span>
            </div>
          )}
          {data.skills.soft?.length > 0 && (
            <div>
              <span style={{ fontFamily: ff, fontSize: fs, fontWeight: 'bold', color: text }}>Soft Skills: </span>
              <span style={{ fontFamily: ff, fontSize: fs, color: '#444' }}>{data.skills.soft.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Projects ───────────────────────────────────────── */}
      {data.projects?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: text }}>{proj.name}</strong>
                {proj.url && <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#666' }}>{proj.url}</span>}
              </div>
              <p style={{ ...baseText, margin: '2px 0' }}>{proj.description}</p>
              {proj.tech?.length > 0 && (
                <p style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#555', margin: 0 }}>
                  <em>Tech: {proj.tech.join(', ')}</em>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Certifications ─────────────────────────────────── */}
      {data.certifications?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Certifications</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: ff, fontSize: fs, color: text }}>{cert.name} — {cert.issuer}</span>
              <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#666' }}>{cert.year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ClassicTemplate.displayName = 'ClassicTemplate';
export default ClassicTemplate;
