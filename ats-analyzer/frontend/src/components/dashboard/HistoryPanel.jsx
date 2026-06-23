// ============================================================
// components/dashboard/HistoryPanel.jsx — Past analyses list
// ============================================================

import { useEffect, useState } from 'react';
import { fetchHistory, deleteAnalysis } from '../../api/analyzeApi';
import toast from 'react-hot-toast';

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-amber-600 bg-amber-100';
  if (score >= 40) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const HistoryPanel = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      toast.error('Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAnalysis(id);
      setHistory(prev => prev.filter(h => h._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-medium">No analyses yet. Upload a resume to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">📜 Recent Analyses</h3>
      {history.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-2xl shrink-0">
              {item.fileType === 'pdf' ? '📕' : '📘'}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate">{item.fileName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreColor(item.score)}`}>
              {item.score}/100
            </span>
            <span className="text-xs text-slate-500 hidden sm:block">{item.scoreLabel}</span>
            <button
              onClick={() => handleDelete(item._id)}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryPanel;
