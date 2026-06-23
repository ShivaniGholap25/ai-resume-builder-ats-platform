// ============================================================
// MinimalTemplate.jsx — Ultra-clean whitespace-focused design
// ============================================================

import { forwardRef } from 'react';

const MinimalTemplate = forwardRef(({ data, theme, font, fontSize = 10 }, ref) => {
  const { accent, text } = theme;
  const ff = font.css;
  const fs = `${fontSize}pt`;
  const subtle = '#6b7280';

  const sectionTitle = {
    fontFamily:    ff,
    fontSize:      `${fontSize}pt`,
    fontWeight:    'bold',
    color:         subtle,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    marginBottom:  '8px',
    marginTop:     '18px',
  };

  const baseText = { fontFamily: ff, fontSize: fs, color: text, lineHeight: 1.6 };

  return (
    <div
      ref={ref}
      id="resume-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '22mm 24mm',
        background: '#ffffff',
        fontFamily: ff,
        fontSize: fs,
        color: text,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: ff, fontSize: `${fontSize + 11}pt`, fontWeight: '300', color: text, margin: 0, letterSpacing: '0.06em' }}>
          {data.name.toUpperCase()}
        </h1>
        {data.title && (
          <p style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: accent, margin: '5px 0 0', fontWeight: '400', letterSpacing: '0.02em' }}>
            {data.title}
          </p>
        )}
        <div style={{ marginTop: '8px', fontSize: `${fontSize - 0.5}pt`, color: subtle, display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
          {data.email    && <span>{data.email}</span>}
          {data.phone    && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github   && <span>{data.github}</span>}
        </div>
        {/* Thin separator line */}
        <div style={{ marginTop: '12px', height: '1px', background: `linear-gradient(to right, ${accent}, transparent)` }} />
      </div>

      {/* ── Summary ────────────────────────────────────────── */}
      {data.summary && (
        <div>
          <h2 style={sectionTitle}>Profile</h2>
          <p style={{ ...baseText, margin: 0, color: '#374151' }}>{data.summary}</p>
        </div>
      )}

      {/* ── Experience ─────────────────────────────────────── */}
      {data.experience?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Experience</h2>
          {data.experience.map((exp, idx) => (
            <div key={exp.id} style={{ marginBottom: idx < data.experience.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, fontWeight: '600', color: text }}>{exp.title}</span>
                <span style={{ fontFamily: ff, fontSize: `${fontSize - 1}pt`, color: subtle }}>
                  {exp.start} – {exp.end}
                </span>
              </div>
              <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: accent, marginBottom: '5px', fontWeight: '500' }}>
                {exp.company}{exp.location ? `,  ${exp.location}` : ''}
              </div>
              <ul style={{ margin: '0 0 0 14px', padding: 0 }}>
                {exp.bullets?.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ ...baseText, marginBottom: '2px', color: '#374151' }}>{b}</li>
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, fontWeight: '600', color: text }}>{edu.degree}</span>
                <span style={{ fontFamily: ff, fontSize: `${fontSize - 1}pt`, color: subtle }}>{edu.start} – {edu.end}</span>
              </div>
              <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: accent, fontWeight: '500' }}>
                {edu.institution}{edu.location ? `,  ${edu.location}` : ''}
                {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ─────────────────────────────────────────── */}
      {(data.skills?.technical?.length > 0 || data.skills?.tools?.length > 0) && (
        <div>
          <h2 style={sectionTitle}>Skills</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {data.skills.technical?.length > 0 && (
                <tr>
                  <td style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: subtle, width: '100px', paddingBottom: '4px', verticalAlign: 'top' }}>Technical</td>
                  <td style={{ fontFamily: ff, fontSize: fs, color: '#374151', paddingBottom: '4px' }}>{data.skills.technical.join('  ·  ')}</td>
                </tr>
              )}
              {data.skills.tools?.length > 0 && (
                <tr>
                  <td style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: subtle, width: '100px', paddingBottom: '4px', verticalAlign: 'top' }}>Tools</td>
                  <td style={{ fontFamily: ff, fontSize: fs, color: '#374151', paddingBottom: '4px' }}>{data.skills.tools.join('  ·  ')}</td>
                </tr>
              )}
              {data.skills.soft?.length > 0 && (
                <tr>
                  <td style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: subtle, width: '100px', verticalAlign: 'top' }}>Soft</td>
                  <td style={{ fontFamily: ff, fontSize: fs, color: '#374151' }}>{data.skills.soft.join('  ·  ')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Projects ───────────────────────────────────────── */}
      {data.projects?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, fontWeight: '600', color: text }}>{proj.name}</span>
                {proj.url && <span style={{ fontFamily: ff, fontSize: `${fontSize - 1}pt`, color: subtle }}>{proj.url}</span>}
              </div>
              <p style={{ ...baseText, margin: '2px 0', color: '#374151' }}>{proj.description}</p>
              {proj.tech?.length > 0 && (
                <p style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: subtle, margin: 0 }}>{proj.tech.join('  ·  ')}</p>
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
              <span style={{ fontFamily: ff, fontSize: fs, color: text }}>{cert.name}  ·  {cert.issuer}</span>
              <span style={{ fontFamily: ff, fontSize: `${fontSize - 1}pt`, color: subtle }}>{cert.year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

MinimalTemplate.displayName = 'MinimalTemplate';
export default MinimalTemplate;
