// ============================================================
// hooks/usePDFExport.js — PDF generation via html2pdf.js
// ============================================================

import { useState } from 'react';
import toast from 'react-hot-toast';

export const usePDFExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportPDF = async (elementId = 'resume-preview', filename = 'resume') => {
    setExporting(true);
    const toastId = toast.loading('Generating PDF…');

    try {
      // Dynamically import to keep bundle size low
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element #${elementId} not found`);
      }

      const opt = {
        margin:       [0, 0, 0, 0],
        filename:     `${filename.replace(/[^a-z0-9_-]/gi, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
          scale:       2,        // High DPI for crisp text
          useCORS:     true,
          letterRendering: true,
          logging:     false,
        },
        jsPDF: {
          unit:        'mm',
          format:      'a4',
          orientation: 'portrait',
          compress:    true,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded!', { id: toastId });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error(`PDF export failed: ${err.message}`, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return { exportPDF, exporting };
};
