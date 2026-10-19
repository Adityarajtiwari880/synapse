import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Columns,
  Sparkles,
  MessageSquareQuote,
  Sliders,
  Share2,
  HelpCircle,
  Maximize2
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
  const [isDockMinimized, setIsDockMinimized] = useState(false);

  const handleTabSwitch = (tab: 'split' | 'canvas' | 'reader') => {
    setActiveTab(tab);
    if (tab === 'split') setSplitLayout('50/50');
    else if (tab === 'canvas') setSplitLayout('canvas-only');
    else setSplitLayout('reader-only');
  };

  const isLight = appSettings.theme === 'light';

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden select-none ${
      isLight ? 'bg-[#f4f6f9]' : 'bg-[#0c0d14]'
    }`}>
      {/* FULL-HEIGHT VIEWPORT: Maximize tablet/iPad reading & canvas area */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex">
        {/* Document Reader Pane */}
        {(activeTab === 'split' || activeTab === 'reader') && (
          <div className={`${
            activeTab === 'split' ? 'w-1/2' : 'w-full'
          } h-full border-r ${isLight ? 'border-slate-200' : 'border-white/10'} shrink-0 relative transition-all duration-200 overflow-hidden`}>
            <DocumentReader />
          </div>
        )}

        {/* Spatial Infinite Canvas Pane */}
        {(activeTab === 'split' || activeTab === 'canvas') && (
          <div className="flex-1 h-full relative transition-all duration-200 overflow-hidden">
            <SpatialCanvas />
          </div>
        )}
      </div>

      {/* FLOATING IPADOS LIQUID GLASS DOCK (Apple HIG Floating Pill Toolbar) */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 bottom-[calc(1rem+env(safe-area-inset-bottom))] pointer-events-auto">
        <div className={`ios-glass px-2.5 sm:px-3 py-1.5 rounded-full shadow-2xl flex items-center space-x-1 sm:space-x-1.5 border transition-all duration-300 ${
          isLight
            ? 'bg-white/90 border-slate-300/80 shadow-slate-400/20'
            : 'bg-[#10121d]/85 border-white/20 shadow-black/60'
        }`}>
          {/* Segmented Layout Switcher (Reader | Split 50/50 | Canvas) */}
          <div className="flex items-center p-0.5 rounded-full bg-black/20 border border-white/10 text-xs">
            <button
              onClick={() => handleTabSwitch('reader')}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold transition active:scale-95 ${
                activeTab === 'reader'
                  ? 'bg-blue-600 text-white shadow-apple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Reader View Only"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reader</span>
            </button>

            <button
              onClick={() => handleTabSwitch('split')}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold transition active:scale-95 ${
                activeTab === 'split'
                  ? 'bg-blue-600 text-white shadow-apple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Side-by-Side 50/50 Split (Default iPad Layout)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split 50/50</span>
            </button>

            <button
              onClick={() => handleTabSwitch('canvas')}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold transition active:scale-95 ${
                activeTab === 'canvas'
                  ? 'bg-blue-600 text-white shadow-apple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Infinite Spatial Canvas Only"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Canvas</span>
            </button>
          </div>

          <div className="h-5 w-px bg-white/15 mx-1"></div>

          {/* AI Ghost Layer Switcher */}
          <button
            onClick={toggleGhostLayer}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 border ${
              ghostLayerActive
                ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300 shadow-ghost-glow'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Ephemeral AI Ghost Suggestions"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">AI Ghost</span>
          </button>

          {/* Ask AI Grounded Assistant */}
          <button
            onClick={onOpenChat}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-600/30 to-blue-600/30 hover:from-indigo-600/50 hover:to-blue-600/50 text-indigo-300 border border-indigo-400/30 flex items-center space-x-1.5 transition active:scale-95"
            title="Ask AI Assistant about open documents"
          >
            <div className="relative">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <span>Ask AI</span>
          </button>

          <div className="h-5 w-px bg-white/15 mx-1 hidden sm:block"></div>

          {/* Share & Quick Tools */}
          <button
            onClick={onOpenShare}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-95"
            title="Share & Collaborate"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickSettings}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-95"
            title="Quick Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-full text-blue-400 hover:text-blue-300 hover:bg-white/10 transition active:scale-95"
            title="Beginner Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
