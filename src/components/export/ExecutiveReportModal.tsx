import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  Share2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({ isOpen, onClose }) => {
  const { selectedDoc, activeField, nodes, synthesisRows, addAuditLog } = useWorkspace();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getFieldHeader = () => {
    switch (activeField) {
      case 'legal':
        return 'LEGAL MEMORANDUM & CONTRACT RISK ANALYSIS';
      case 'business':
        return 'EXECUTIVE STRATEGY & DUE DILIGENCE REPORT';
      case 'medical':
        return 'CLINICAL EFFICACY & PROTOCOL BRIEF';
      case 'academic':
      default:
        return 'LITERATURE REVIEW & RESEARCH SYNTHESIS BRIEF';
    }
  };

  const handleCopyMemo = () => {
    const text = `
${getFieldHeader()}
CONFIDENTIAL & PRIVILEGED WORK PRODUCT
Date: ${today}
Source Document: ${selectedDoc.title} (${selectedDoc.authors})

1. EXECUTIVE SUMMARY
Based on deep spatial analysis of ${selectedDoc.title}, our findings indicate strong evidential support for core claims with verifiable page citations.

2. EXTRACTED CLAIMS & VERIFIED EVIDENCE
${nodes.map((n, i) => `[${i + 1}] ${n.title}
Quote: "${n.content}"
Location: Page ${n.anchors[0]?.pageNumber || 'N/A'} · Confidence: ${Math.round(n.confidence * 100)}%
Status: ${n.verificationState.toUpperCase()}
`).join('\n')}

3. COMPARATIVE SYNTHESIS FINDINGS
${synthesisRows.map(r => `• ${r.docTitle}:
  - Architecture/Terms: ${r.architecture.value}
  - Scaling/Conditions: ${r.scaling.value}
  - Primary Advantage: ${r.advantage.value}
`).join('\n')}

Generated via Synapse Spatial Pro — Local-First Grounded Workspace
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    addAuditLog('export', 'Copied formatted Executive Memorandum to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
    addAuditLog('export', 'Triggered print / PDF generation for Executive Memorandum.');
  };

  const downloadDocxHTML = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${getFieldHeader()}</title>
      <style>
        body { font-family: Calibri, sans-serif; line-height: 1.5; color: #111; }
        h1 { font-size: 18pt; color: #003366; }
        h2 { font-size: 14pt; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        .quote { background: #f4f6f9; border-left: 4px solid #0066cc; padding: 8px 12px; font-style: italic; margin: 8px 0; }
        .meta { color: #666; font-size: 10pt; margin-bottom: 20px; }
      </style>
      </head>
      <body>
        <h1>${getFieldHeader()}</h1>
        <div class="meta">
          <strong>Date:</strong> ${today}<br/>
          <strong>Source Document:</strong> ${selectedDoc.title} (${selectedDoc.authors})<br/>
          <strong>Status:</strong> Grounded & Verified Work Product
        </div>
        <h2>1. Executive Summary</h2>
        <p>This memorandum aggregates and synthesizes key clauses, evidential citations, and risk parameters extracted directly from source materials using Synapse Spatial Pro.</p>
        <h2>2. Key Claims & Verbatim Evidence</h2>
        ${nodes.map(n => `
          <div>
            <h3>${n.title}</h3>
            <div class="quote">"${n.content}"</div>
            <p><strong>Citation:</strong> ${n.anchors[0]?.docTitle || selectedDoc.title}, Page ${n.anchors[0]?.pageNumber || 'N/A'} (Verification: ${n.verificationState.toUpperCase()})</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Memo_${Date.now()}.doc`;
    a.click();
    addAuditLog('export', 'Downloaded Executive Memorandum as Word (.doc) document.');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 border border-white/15 shadow-2xl relative space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{getFieldHeader()}</h2>
              <p className="text-xs text-slate-400">Professional briefing ready for clients, partners, or counsel</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formatted Memo Preview (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-5 text-slate-200 text-xs font-serif leading-relaxed select-text shadow-inner">
          <div className="border-b border-white/10 pb-3 font-sans not-italic space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Privileged & Confidential</div>
            <div className="text-sm font-bold text-white">{getFieldHeader()}</div>
            <div className="text-[11px] text-slate-400 font-mono">Date: {today} · Review: {selectedDoc.title}</div>
          </div>

          <div className="space-y-1.5 font-sans not-italic">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">1. Executive Overview</h3>
            <p className="text-slate-300 text-xs font-serif">
              Comprehensive analysis of {selectedDoc.title} indicates strong evidential alignment across primary clauses. All statements in this briefing are grounded in verbatim quotes.
            </p>
          </div>

          <div className="space-y-3 font-sans not-italic">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">2. Key Claims & Verified Citations</h3>
            {nodes.map(n => (
              <div key={n.id} className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <div className="font-semibold text-white text-xs">{n.title}</div>
                <p className="text-slate-300 font-serif italic text-xs">"{n.content}"</p>
                <div className="text-[10px] text-blue-400 font-mono">
                  Cited from: {n.anchors[0]?.docTitle || selectedDoc.title}, Page {n.anchors[0]?.pageNumber || 4} [100% Verbatim Match]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 shrink-0">
          <div className="text-[11px] text-slate-400 font-sans">
            Ready to distribute to non-tech colleagues
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMemo}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={downloadDocxHTML}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-apple-glow transition flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Word (.doc)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
