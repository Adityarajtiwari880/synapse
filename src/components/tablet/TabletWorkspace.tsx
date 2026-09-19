import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Columns,
  Sparkles,
  MessageSquareQuote,
  PenTool,
  Highlighter,
  Eraser,
  RotateCcw,
  Sliders,
  Share2,
  HelpCircle
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DocumentReader } from '../reader/DocumentReader';
import { SpatialCanvas } from '../canvas/SpatialCanvas';

interface TabletWorkspaceProps {
  onOpenChat: () => void;
  onOpenShare: () => void;
  onOpenQuickSettings: () => void;
  onOpenGuide: () => void;
}

export const TabletWorkspace: React.FC<TabletWorkspaceProps> = ({
  onOpenChat,
  onOpenShare,
  onOpenQuickSettings,
  onOpenGuide
}) => {
  const { splitLayout, setSplitLayout, ghostLayerActive, toggleGhostLayer, appSettings } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'split' | 'canvas' | 'reader'>('split');

  const handleTabSwitch = (tab: 'split' | 'canvas' | 'reader') => {
    setActiveTab(tab);
    if (tab === 'split') setSplitLayout('50/50');
    else if (tab === 'canvas') setSplitLayout('canvas-only');
    else setSplitLayout('reader-only');
  };

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden ${appSettings.theme === 'light' ? 'bg-[#f4f6f9]' : 'bg-[#0c0d14]'}`}>
      {/* TABLET TOP APP BAR */}
      <div className="h-12 px-4 glass-panel border-b border-white/10 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm tracking-tight text-white">Synapse Touch</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
            iPadOS Optimized
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleGhostLayer}
            className={`px-2.5 py-1 rounded-xl text-xs flex items-center space-x-1.5 border transition ${
              ghostLayerActive
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-ghost-glow'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">AI Ghosts</span>
          </button>

          <button
            onClick={onOpenShare}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            title="Share & Collaborate"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickSettings}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            title="Quick Customizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 border border-white/10 transition"
            title="Beginner Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Document Reader Pane */}
        {(activeTab === 'split' || activeTab === 'reader') && (
          <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'} h-full border-r border-white/10 shrink-0 relative transition-all duration-200`}>
            <DocumentReader />
          </div>
        )}

        {/* Spatial Canvas Pane */}
        {(activeTab === 'split' || activeTab === 'canvas') && (
          <div className="flex-1 h-full relative transition-all duration-200">
            <SpatialCanvas />
          </div>
        )}
      </div>

      {/* THUMB-FRIENDLY TABLET BOTTOM NAVIGATION BAR (APPLE HIG STYLE) */}
      <div className="h-16 glass-panel border-t border-white/10 px-6 flex items-center justify-around shrink-0 z-40 select-none pb-1">
        <button
          onClick={() => handleTabSwitch('reader')}
          className={`flex flex-col items-center space-y-1 transition ${
            activeTab === 'reader' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Reader</span>
        </button>

        <button
          onClick={() => handleTabSwitch('split')}
          className={`flex flex-col items-center space-y-1 transition ${
            activeTab === 'split' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Columns className="w-5 h-5" />
          <span className="text-[10px] font-medium">Split 50/50</span>
        </button>

        <button
          onClick={() => handleTabSwitch('canvas')}
          className={`flex flex-col items-center space-y-1 transition ${
            activeTab === 'canvas' ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium">Canvas</span>
        </button>

        <button
          onClick={onOpenChat}
          className="flex flex-col items-center space-y-1 text-indigo-300 hover:text-indigo-200 transition"
        >
          <div className="relative">
            <MessageSquareQuote className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-medium">Ask AI</span>
        </button>
      </div>
    </div>
  );
};
