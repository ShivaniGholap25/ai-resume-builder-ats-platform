// ============================================================
// ModernTemplate.jsx — Contemporary with left accent bar
// ============================================================

import { forwardRef } from 'react';

const ModernTemplate = forwardRef(({ data, theme, font, fontSize = 10 }, ref) => {
  const { accent, text } = theme;
  const ff = font.css;
  const fs = `${fontSize}pt`;

  const sectionTitle = {
    fontFamily: ff,
    fontSize:   `${fontSize + 1}pt`,
    fontWeight: 'bold',
    color:      accent,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    marginTop:    '16px',
    paddingLeft:  '10px',
    borderLeft:   `4px solid ${accent}`,
  };

  const baseText = { fontFamily: ff, fontSize: fs, color: text, lineHeight: 1.55 };

  return (
    <div
      ref={ref}
      id="resume-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '16mm 20mm',
        background: '#ffffff',
        fontFamily: ff,
        fontSize: fs,
        color: text,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid #e2e8f0`, paddingBottom: '12px' }}>
          <div>
            <h1 style={{ fontFamily: ff, fontSize: `${fontSize + 12}pt`, fontWeight: '900', color: accent, margin: 0, lineHeight: 1.1 }}>
              {data.name}
            </h1>
            {data.title && (
              <p style={{ fontFamily: ff, fontSize: `${fontSize + 1}pt`, color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>
                {data.title}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: `${fontSize - 0.5}pt`, color: '#475569', lineHeight: 1.7 }}>
            {data.email    && <div>{data.email}</div>}
            {data.phone    && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
            {data.linkedin && <div>{data.linkedin}</div>}
            {data.github   && <div>{data.github}</div>}
          </div>
        </div>
      </div>

      {/* ── Summary ────────────────────────────────────────── */}
      {data.summary && (
        <div>
          <h2 style={sectionTitle}>Summary</h2>
          <p style={{ ...baseText, margin: '0 0 0 10px' }}>{data.summary}</p>
        </div>
      )}

      {/* ── Experience ─────────────────────────────────────── */}
      {data.experience?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Experience</h2>
          <div style={{ paddingLeft: '10px' }}>
            {data.experience.map((exp, idx) => (
              <div key={exp.id} style={{ marginBottom: idx < data.experience.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontFamily: ff, fontSize: `${fontSize + 1}pt`, color: text }}>{exp.title}</strong>
                  <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#64748b', fontStyle: 'italic' }}>
                    {exp.start} – {exp.end}
                  </span>
                </div>
                <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: accent, fontWeight: '600', marginBottom: '4px' }}>
                  {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                </div>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {exp.bullets?.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ ...baseText, marginBottom: '2px' }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ─────────────────────────────────────────── */}
      {(data.skills?.technical?.length > 0 || data.skills?.tools?.length > 0) && (
        <div>
          <h2 style={sectionTitle}>Skills</h2>
          <div style={{ paddingLeft: '10px' }}>
            {data.skills.technical?.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontFamily: ff, fontSize: fs, fontWeight: '700', color: accent }}>Technical: </span>
                <span style={{ fontFamily: ff, fontSize: fs, color: '#475569' }}>{data.skills.technical.join(' · ')}</span>
              </div>
            )}
            {data.skills.tools?.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontFamily: ff, fontSize: fs, fontWeight: '700', color: accent }}>Tools & Platforms: </span>
                <span style={{ fontFamily: ff, fontSize: fs, color: '#475569' }}>{data.skills.tools.join(' · ')}</span>
              </div>
            )}
            {data.skills.soft?.length > 0 && (
              <div>
                <span style={{ fontFamily: ff, fontSize: fs, fontWeight: '700', color: accent }}>Soft Skills: </span>
                <span style={{ fontFamily: ff, fontSize: fs, color: '#475569' }}>{data.skills.soft.join(' · ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Education ──────────────────────────────────────── */}
      {data.education?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Education</h2>
          <div style={{ paddingLeft: '10px' }}>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: text }}>{edu.degree}</strong>
                  <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#64748b', fontStyle: 'italic' }}>{edu.start} – {edu.end}</span>
                </div>
                <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: accent, fontWeight: '600' }}>
                  {edu.institution}{edu.location ? ` | ${edu.location}` : ''}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ───────────────────────────────────────── */}
      {data.projects?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Projects</h2>
          <div style={{ paddingLeft: '10px' }}>
            {data.projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: text }}>{proj.name}</strong>
                  {proj.url && <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: accent }}>{proj.url}</span>}
                </div>
                <p style={{ ...baseText, margin: '2px 0' }}>{proj.description}</p>
                {proj.tech?.length > 0 && (
                  <p style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#64748b', margin: 0 }}>
                    {proj.tech.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Certifications ─────────────────────────────────── */}
      {data.certifications?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Certifications</h2>
          <div style={{ paddingLeft: '10px' }}>
            {data.certifications.map((cert) => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: ff, fontSize: fs, color: text }}>{cert.name} — <em>{cert.issuer}</em></span>
                <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#64748b' }}>{cert.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ModernTemplate.displayName = 'ModernTemplate';
export default ModernTemplate;
