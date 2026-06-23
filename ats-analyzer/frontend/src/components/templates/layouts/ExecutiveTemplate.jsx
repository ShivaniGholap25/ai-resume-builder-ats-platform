// ============================================================
// ExecutiveTemplate.jsx — Bold header, strong typography
// ============================================================

import { forwardRef } from 'react';

const ExecutiveTemplate = forwardRef(({ data, theme, font, fontSize = 10 }, ref) => {
  const { accent, light, text } = theme;
  const ff = font.css;
  const fs = `${fontSize}pt`;

  const sectionTitle = {
    fontFamily: ff,
    fontSize:   `${fontSize + 1}pt`,
    fontWeight: 'bold',
    color:      '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    background:    accent,
    padding:       '4px 10px',
    marginBottom:  '10px',
    marginTop:     '16px',
  };

  const baseText = { fontFamily: ff, fontSize: fs, color: text, lineHeight: 1.55 };

  return (
    <div
      ref={ref}
      id="resume-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '0',
        background: '#ffffff',
        fontFamily: ff,
        fontSize: fs,
        color: text,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header band ────────────────────────────────────── */}
      <div style={{ background: accent, padding: '20px 24px 16px', color: '#fff' }}>
        <h1 style={{ fontFamily: ff, fontSize: `${fontSize + 14}pt`, fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
          {data.name}
        </h1>
        {data.title && (
          <p style={{ fontFamily: ff, fontSize: `${fontSize + 2}pt`, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: '400', letterSpacing: '0.05em' }}>
            {data.title}
          </p>
        )}
        <div style={{ marginTop: '10px', fontSize: `${fontSize - 0.5}pt`, color: 'rgba(255,255,255,0.8)', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {data.email    && <span>✉ {data.email}</span>}
          {data.phone    && <span>✆ {data.phone}</span>}
          {data.location && <span>⌖ {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.github   && <span>⌥ {data.github}</span>}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ padding: '0 24px 20px' }}>

        {/* Summary */}
        {data.summary && (
          <div>
            <h2 style={sectionTitle}>Executive Summary</h2>
            <p style={{ ...baseText, margin: 0, fontStyle: 'italic', color: '#374151' }}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div>
            <h2 style={sectionTitle}>Professional Experience</h2>
            {data.experience.map((exp, idx) => (
              <div key={exp.id} style={{ marginBottom: idx < data.experience.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px', marginBottom: '5px' }}>
                  <strong style={{ fontFamily: ff, fontSize: `${fontSize + 1.5}pt`, color: accent }}>{exp.title}</strong>
                  <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280', fontWeight: '600' }}>
                    {exp.start} – {exp.end}
                  </span>
                </div>
                <div style={{ fontFamily: ff, fontSize: `${fontSize}pt`, color: '#374151', fontWeight: '600', marginBottom: '5px' }}>
                  {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                </div>
                <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
                  {exp.bullets?.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ ...baseText, marginBottom: '3px' }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(data.skills?.technical?.length > 0 || data.skills?.tools?.length > 0) && (
          <div>
            <h2 style={sectionTitle}>Core Competencies</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[...(data.skills.technical || []), ...(data.skills.tools || [])].map((skill, i) => (
                <div key={i} style={{ fontFamily: ff, fontSize: fs, color: text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: accent, fontWeight: 'bold' }}>▸</span> {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <div>
            <h2 style={sectionTitle}>Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: accent }}>{edu.degree}</strong>
                  <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280' }}>{edu.start} – {edu.end}</span>
                </div>
                <div style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#374151' }}>
                  {edu.institution}{edu.location ? ` | ${edu.location}` : ''}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <div>
            <h2 style={sectionTitle}>Certifications</h2>
            {data.certifications.map((cert) => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: ff, fontSize: fs, color: text, fontWeight: '600' }}>{cert.name}</span>
                <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280' }}>{cert.issuer} · {cert.year}</span>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <div>
            <h2 style={sectionTitle}>Notable Projects</h2>
            {data.projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <strong style={{ fontFamily: ff, fontSize: `${fontSize + 0.5}pt`, color: accent }}>{proj.name}</strong>
                {proj.url && <span style={{ fontFamily: ff, fontSize: `${fontSize - 0.5}pt`, color: '#6b7280' }}> — {proj.url}</span>}
                <p style={{ ...baseText, margin: '2px 0' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ExecutiveTemplate.displayName = 'ExecutiveTemplate';
export default ExecutiveTemplate;
