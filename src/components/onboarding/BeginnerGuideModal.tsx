import React from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  ArrowRight,
  CheckCircle,
  FileText,
  Bookmark,
  Layers,
  Bot
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({ isOpen, onClose }) => {
  const { setActiveView, setSplitLayout, addAuditLog } = useWorkspace();

  if (!isOpen) return null;

  const launchTemplate = (templateName: string) => {
    if (templateName === 'compare') {
      setSplitLayout('50/50');
      setActiveView('workspace');
    } else if (templateName === 'matrix') {
      setActiveView('matrix');
    } else {
      setSplitLayout('canvas-only');
      setActiveView('workspace');
    }
    addAuditLog('node_create', `Launched beginner starter template: "${templateName}".`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 border border-white/15 shadow-2xl relative space-y-7">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Effortless Spatial Research
          </h2>
          <p className="text-xs text-slate-300">
            Welcome! Synapse turns complex academic papers and legal briefs into connected ideas on an infinite canvas. Pick a starter template to jump in:
          </p>
        </div>

        {/* 1-CLICK STARTER TEMPLATES FOR BEGINNERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Template 1: Compare 2 Papers */}
          <div
            onClick={() => launchTemplate('compare')}
            className="glass-card rounded-2xl p-4.5 space-y-2.5 cursor-pointer hover:border-blue-500/50 group transition flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Compare 2 Papers</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Side-by-side reading with pinch-to-fold text squeeze and live excerpt dragging.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-blue-400 font-medium">
              <span>Start Comparison</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Template 2: Literature Review Matrix */}
          <div
            onClick={() => launchTemplate('matrix')}
            className="glass-card rounded-2xl p-4.5 space-y-2.5 cursor-pointer hover:border-indigo-500/50 group transition flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Synthesis Matrix</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Auto-extracted cross-paper comparison matrix where every single cell has verified quotes.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-indigo-300 font-medium">
              <span>Open Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Template 3: Freeform Infinite Canvas */}
          <div
            onClick={() => launchTemplate('canvas')}
            className="glass-card rounded-2xl p-4.5 space-y-2.5 cursor-pointer hover:border-emerald-500/50 group transition flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                <Bookmark className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Infinite Mind Canvas</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Freeform infinite workspace with Apple Pencil ink drawing, card pins, and frames.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
              <span>Open Canvas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* 3-STEP BEGINNER VISUAL CHEAT SHEET */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            How Synapse Works in 3 Intuitive Gestures:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <span><strong>Select Text:</strong> Drag over text to highlight and tap "Tear to Workspace".</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <span><strong>Connect Thoughts:</strong> Drag from card pins to draw connecting reasoning arrows.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <span><strong>Ask AI Partner:</strong> Tap "Ask AI" for plain-English explanations with citations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
