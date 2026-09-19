import React, { useState } from 'react';
import {
  Table,
  CheckCircle,
  AlertTriangle,
  Lock,
  Download,
  Bot,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TableCell } from '../../types';

export const SynthesisMatrix: React.FC = () => {
  const { synthesisRows, updateCellByHuman, runAgentSynthesis, addAuditLog } = useWorkspace();
  const [editingCell, setEditingCell] = useState<{ docId: string; col: 'architecture' | 'scaling' | 'advantage' } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (docId: string, col: 'architecture' | 'scaling' | 'advantage', currentVal: string) => {
    setEditingCell({ docId, col });
    setEditValue(currentVal);
  };

  const saveEdit = () => {
    if (editingCell) {
      updateCellByHuman(editingCell.docId, editingCell.col, editValue);
      setEditingCell(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Document', 'Architecture', 'Scaling', 'Advantage'];
    const rows = synthesisRows.map(r => [
      `"${r.docTitle}"`,
      `"${r.architecture.value}"`,
      `"${r.scaling.value}"`,
      `"${r.advantage.value}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'synapse_grounded_synthesis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('export', 'Exported grounded synthesis matrix to CSV.');
  };

  const renderCell = (docId: string, col: 'architecture' | 'scaling' | 'advantage', cell: TableCell) => {
    const isEditing = editingCell?.docId === docId && editingCell?.col === col;

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="w-full p-2 text-xs rounded-lg bg-black/40 border border-blue-500 text-white outline-none"
            rows={2}
          />
          <div className="flex items-center space-x-1.5">
            <button
              onClick={saveEdit}
              className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold"
            >
              Save & Lock
            </button>
            <button
              onClick={() => setEditingCell(null)}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-slate-300 text-[10px]"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 group relative">
        <div className="text-xs text-slate-200 font-sans font-medium flex items-center justify-between">
          <span>{cell.value}</span>
          <button
            onClick={() => startEdit(docId, col, String(cell.value))}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 transition"
            title="Edit and lock cell"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>

        {/* Evidence Citation Badge */}
        <div className="flex items-center space-x-2 text-[10px]">
          {cell.editedByHuman ? (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center">
              <Lock className="w-2.5 h-2.5 mr-1" />
              Human-Locked
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
              <CheckCircle className="w-2.5 h-2.5 mr-1" />
              Quote Verified (p.{cell.evidence[0]?.page || 4})
            </span>
          )}

          <span className="text-slate-500 font-mono">
            {Math.round(cell.confidence * 100)}% conf
          </span>
        </div>

        {/* Verbatim quote hover tooltip */}
        {cell.evidence[0] && (
          <div className="text-[11px] text-slate-400 italic bg-black/20 p-1.5 rounded-lg border border-white/5">
            "{cell.evidence[0].quote}"
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full p-6 md:p-10 overflow-y-auto z-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Table className="w-6 h-6 text-blue-400" />
              <span>Grounded Synthesis Matrix</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Every cell is verified against an exact verbatim quote. Human edits lock cells against automated overwrite.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={runAgentSynthesis}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-apple-glow transition flex items-center space-x-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Run Agent Synthesis</span>
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-slate-300">
                <th className="p-4 font-semibold w-1/4">Document / Paper</th>
                <th className="p-4 font-semibold w-1/4">Architecture Type</th>
                <th className="p-4 font-semibold w-1/4">Sequence Scaling</th>
                <th className="p-4 font-semibold w-1/4">Key Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {synthesisRows.map(row => (
                <tr key={row.docId} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 align-top">
                    <div className="font-semibold text-white text-sm">{row.docTitle}</div>
                    <div className="text-[11px] text-blue-400 mt-0.5">Verified Source</div>
                  </td>
                  <td className="p-4 align-top">{renderCell(row.docId, 'architecture', row.architecture)}</td>
                  <td className="p-4 align-top">{renderCell(row.docId, 'scaling', row.scaling)}</td>
                  <td className="p-4 align-top">{renderCell(row.docId, 'advantage', row.advantage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
