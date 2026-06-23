// ============================================================
// TechnicalTemplate.jsx — Skills-first layout for tech roles
// ============================================================

import { forwardRef } from 'react';

const TechnicalTemplate = forwardRef(({ data, theme, font, fontSize = 10 }, ref) => {
  const { accent, text } = theme;
  const ff = font.css;
  const fs = `${fontSize}pt`;

  const sectionTitle = {
    fontFamily:    ff,
    fontSize:      `${fontSize + 1}pt`,
    fontWeight:    'bold',
    color:         '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background:    accent,
    padding:       '2px 8px',
    marginBottom:  '8px',
    marginTop:     '14px',
    display:       'inline-block',
  };

  const baseText = { fontFamily: ff, fontSize: fs, color: text, lineHeight: 1.55 };

  // Split all skills into columns
  const allTech = [...(data.skills?.technical || []), ...(data.skills?.tools || [])];
  const col1 = allTech.slice(0, Math.ceil(allTech.length / 2));
  const col2 = allTech.slice(Math.ceil(allTech.length / 2));

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
      <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: `2px solid ${accent}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                <h1 style={{ fontFamily: ff, fontSize: `${fontSize + 11}pt`, fontWeight: '900', color: text, margin: 0 }}>
                  {data.name}
                </h1>
                {data.title && (
                  <p style={{ fontFamily: ff, fontSize: `${fontSize + 1.5}pt`, color: accent, margin: '3px 0 0', fontWeight: '600' }}>
                    {data.title}
                  </p>
                )}
              </td>
              <td style={{ verticalAlign: 'top', textAlign: 'right', fontSize: `${fontSize - 0.5}pt`, color: '#475569', lineHeight: 1.8 }}>
                {data.email    && <div>{data.email}</div>}
                {data.phone    && <div>{data.phone}</div>}
                {data.location && <div>{data.location}</div>}
                {data.linkedin && <div>{data.linkedin}</div>}
                {data.github   && <div>{data.github}</div>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Technical Skills FIRST (key differentiator) ─────── */}
      {allTech.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Technical Skills</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', width: '50%', paddingRight: '12px' }}>
                  {col1.map((skill, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ color: accent, fontSize: '8pt', fontWeight: 'bold' }}>■</span>
                      <span style={{ fontFamily: ff, fontSize: fs, color: text }}>{skill}</span>
                    </div>
                  ))}
                </td>
                <td style={{ verticalAlign: 'top', width: '50%' }}>
                  {col2.map((skill, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ color: accent, fontSize: '8pt', fontWeight: 'bold' }}>■</span>
                      <span style={{ fontFamily: ff, fontSize: fs, color: text }}>{skill}</span>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          {data.skills?.soft?.length > 0 && (
            <div style={{ marginTop: '6px' }}>
              <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, fontWeight: 'bold', color: '#6b7280' }}>Additional: </span>
              <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280' }}>{data.skills.soft.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Summary ────────────────────────────────────────── */}
      {data.summary && (
        <div>
          <h2 style={sectionTitle}>Summary</h2>
          <p style={{ ...baseText, margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {/* ── Experience ─────────────────────────────────────── */}
      {data.experience?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Work Experience</h2>
          {data.experience.map((exp, idx) => (
            <div key={exp.id} style={{ marginBottom: idx < data.experience.length - 1 ? '12px' : 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td>
                      <strong style={{ fontFamily: ff, fontSize: `${fontSize + 1}pt`, color: accent }}>{exp.title}</strong>
                      <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280', marginLeft: '8px' }}>
                        @ {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {exp.start} – {exp.end}
                    </td>
                  </tr>
                </tbody>
              </table>
              <ul style={{ margin: '5px 0 0 16px', padding: 0 }}>
                {exp.bullets?.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ ...baseText, marginBottom: '2px' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Projects (important for tech roles) ───────────── */}
      {data.projects?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td>
                      <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: accent }}>{proj.name}</strong>
                      {proj.tech?.length > 0 && (
                        <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280', marginLeft: '8px' }}>
                          [{proj.tech.join(', ')}]
                        </span>
                      )}
                    </td>
                    {proj.url && (
                      <td style={{ textAlign: 'right', fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: accent }}>
                        {proj.url}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
              <p style={{ ...baseText, margin: '2px 0 0', color: '#374151' }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Education ──────────────────────────────────────── */}
      {data.education?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td>
                      <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: text }}>{edu.degree}</strong>
                      <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280', marginLeft: '8px' }}>
                        {edu.institution}{edu.location ? ` · ${edu.location}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {edu.start} – {edu.end}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* ── Certifications ─────────────────────────────────── */}
      {data.certifications?.length > 0 && (
        <div>
          <h2 style={sectionTitle}>Certifications</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontFamily: ff, fontSize: fs, color: text }}>
                <span style={{ color: accent, fontWeight: 'bold', marginRight: '6px' }}>■</span>
                {cert.name} — {cert.issuer}
              </span>
              <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280' }}>{cert.year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

TechnicalTemplate.displayName = 'TechnicalTemplate';
export default TechnicalTemplate;
