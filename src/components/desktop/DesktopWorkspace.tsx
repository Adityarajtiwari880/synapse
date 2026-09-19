import React, { useState, useEffect, useRef } from 'react';
import {
  Columns,
  Maximize2,
  Minimize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare,
  Sparkles,
  Share2,
  HelpCircle,
  Bookmark,
  GripVertical,
  RotateCcw,
  Layout,
  BookOpen,
  Sliders,
  Bot,
  Sun,
  Moon,
  FileCheck,
  X
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DocumentReader } from '../reader/DocumentReader';
import { SpatialCanvas } from '../canvas/SpatialCanvas';

interface DesktopWorkspaceProps {
  onOpenChat: () => void;
  onOpenShare: () => void;
  onOpenGuide: () => void;
  onOpenExecutiveReport?: () => void;
  onOpenQuickSettings?: () => void;
}

export const DesktopWorkspace: React.FC<DesktopWorkspaceProps> = ({
  onOpenChat,
  onOpenShare,
  onOpenGuide,
  onOpenExecutiveReport,
  onOpenQuickSettings
}) => {
  const {
    selectedDoc,
    documents,
    selectDocument,
    splitLayout,
    setSplitLayout,
    nodes,
    appSettings,
    collaborators,
    updateAppSettings
  } = useWorkspace();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'none' | 'settings' | 'ai' | 'export' | 'share' | 'inspector'>('none');

  // Dynamic Draggable Split Resizer State (15% - 85%)
  const [splitPercent, setSplitPercent] = useState<number>(() => {
    if (splitLayout === '70/30') return 70;
    if (splitLayout === '30/70') return 30;
    return 50;
  });
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Sync splitLayout changes to splitPercent
  useEffect(() => {
    if (splitLayout === '70/30') setSplitPercent(70);
    else if (splitLayout === '30/70') setSplitPercent(30);
    else if (splitLayout === '50/50') setSplitPercent(50);
  }, [splitLayout]);

  // Mouse & Touch Dragging for Splitter
  const handleSplitterPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);

    const startX = e.clientX;
    const container = splitContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentX = moveEvent.clientX;
      const newPct = ((currentX - rect.left) / rect.width) * 100;
      const clamped = Math.min(85, Math.max(15, newPct));
      setSplitPercent(Math.round(clamped));
    };

    const handlePointerUp = () => {
      setIsDraggingSplitter(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const isReaderOnly = splitLayout === 'reader-only';
  const isCanvasOnly = splitLayout === 'canvas-only';

  return (
    <div
      className={`h-full w-full flex relative overflow-hidden ${
        isDraggingSplitter ? 'select-none cursor-col-resize' : ''
      } ${appSettings.theme === 'light' ? 'bg-[#f4f6f9]' : 'bg-[#0c0d14]'}`}
    >
      {/* COLLAPSIBLE LEFT DOCUMENT RAIL */}
      {isSidebarOpen && (
        <aside className="w-64 h-full glass-panel border-r border-white/10 flex flex-col shrink-0 z-20 select-none animate-in slide-in-from-left duration-200">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Documents & Papers
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:text-white text-slate-400 rounded transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 text-xs">
            {documents.map(doc => (
              <div
                key={doc.id}
                onClick={() => selectDocument(doc.id)}
                className={`p-3 rounded-xl cursor-pointer transition border ${
                  selectedDoc.id === doc.id
                    ? 'bg-blue-600/20 border-blue-500/40 text-white font-semibold'
                    : 'glass-panel-light border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                  {doc.pages} pages · {doc.highlightsCount} highlights
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* SIDEBAR EXPAND BUTTON */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`absolute left-2.5 top-14 z-30 p-1.5 rounded-xl border shadow-xl transition active:scale-95 flex items-center space-x-1 ${
            appSettings.theme === 'light'
              ? 'bg-white/90 border-slate-300/80 text-slate-700 hover:text-slate-900 shadow-slate-200'
              : 'glass-panel text-slate-300 hover:text-white border-white/10 shadow-black/60'
          }`}
          title="Open Document Navigator"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </button>
      )}

      {/* DUAL WORKSPACE SPLIT AREA WITH DRAGGABLE DIVIDER */}
      <div ref={splitContainerRef} className="flex-1 h-full flex relative overflow-hidden">
        {/* PDF / Document Section */}
        {!isCanvasOnly && (
          <div
            style={{
              width: isReaderOnly ? '100%' : `${splitPercent}%`,
              transition: isDraggingSplitter ? 'none' : 'width 0.15s ease'
            }}
            className="h-full shrink-0 relative overflow-hidden will-change-transform"
          >
            <DocumentReader />
          </div>
        )}

        {/* DRAGGABLE RESIZE DIVIDER BAR */}
        {!isReaderOnly && !isCanvasOnly && (
          <div
            onPointerDown={handleSplitterPointerDown}
            onDoubleClick={() => {
              setSplitPercent(50);
              setSplitLayout('50/50');
            }}
            className={`w-3.5 -mx-1.5 h-full relative z-30 flex items-center justify-center cursor-col-resize select-none group resizer-divider ${
              isDraggingSplitter ? 'dragging' : ''
            }`}
            title="Drag to resize PDF and Mind Map · Double click to reset 50/50"
          >
            {/* Center line */}
            <div className="w-[3px] h-full bg-white/10 group-hover:bg-blue-500 transition-colors pointer-events-none"></div>

            {/* Tactile Grab Handle Pill */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 px-1 py-3 rounded-full border shadow-xl flex flex-col items-center justify-center space-y-1 transition-all ${
                isDraggingSplitter
                  ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-apple-glow'
                  : 'glass-panel border-white/20 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400'
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Split Percentage Tooltip while dragging */}
            {isDraggingSplitter && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-mono font-bold shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap z-50 animate-in fade-in">
                {splitPercent}% PDF · {100 - splitPercent}% Map
              </div>
            )}
          </div>
        )}

        {/* Mind Map / Spatial Canvas Section */}
        {!isReaderOnly && (
          <div
            style={{
              width: isCanvasOnly ? '100%' : `${100 - splitPercent}%`,
              transition: isDraggingSplitter ? 'none' : 'width 0.15s ease'
            }}
            className="h-full flex-1 relative overflow-hidden will-change-transform"
          >
            <SpatialCanvas />
          </div>
        )}

        {/* (Split presets now live cleanly in the Header) */}
      </div>

      {/* RIGHT-SIDE QUICK SETTINGS & PRODUCTIVITY RAIL */}
      <div className="flex h-full shrink-0 z-30 select-none">
        {/* SLIDE-OUT PRODUCTIVITY DRAWER */}
        {activeRightTab !== 'none' && (
          <aside className="w-80 h-full glass-panel border-l border-white/10 flex flex-col shrink-0 animate-in slide-in-from-right duration-200 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/20">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                {activeRightTab === 'settings' && (
                  <>
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Settings & Layout</span>
                  </>
                )}
                {activeRightTab === 'ai' && (
                  <>
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Document Assistant</span>
                  </>
                )}
                {activeRightTab === 'export' && (
                  <>
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export & Summaries</span>
                  </>
                )}
                {activeRightTab === 'share' && (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Team Collaboration</span>
                  </>
                )}
                {activeRightTab === 'inspector' && (
                  <>
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>Card & Quote Inspector</span>
                  </>
                )}
              </span>
              <button
                onClick={() => setActiveRightTab('none')}
                className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-white/10 transition"
                title="Close drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* TAB 1: QUICK SETTINGS */}
              {activeRightTab === 'settings' && (
                <div className="space-y-4">
                  {/* Theme Mode */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Appearance & Theme
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => updateAppSettings({ theme: 'light' })}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-2 transition ${
                          appSettings.theme === 'light'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-semibold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Day Mode</span>
                      </button>

                      <button
                        onClick={() => updateAppSettings({ theme: 'dark' })}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-2 transition ${
                          appSettings.theme === 'dark'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-semibold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Night Mode</span>
                      </button>

                      <button
                        onClick={() => updateAppSettings({ theme: 'sepia' })}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-2 transition ${
                          appSettings.theme === 'sepia'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-semibold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-amber-500 text-xs">📜</span>
                        <span>Warm Sepia</span>
                      </button>

                      <button
                        onClick={() => updateAppSettings({ theme: 'midnight' })}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-2 transition ${
                          appSettings.theme === 'midnight'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-semibold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-cyan-400 text-xs">🌑</span>
                        <span>OLED Black</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Workspace Split Presets */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Workspace Split Presets
                    </label>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <button
                        onClick={() => {
                          setSplitLayout('30/70');
                          setSplitPercent(30);
                        }}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          splitPercent <= 35 && !isReaderOnly && !isCanvasOnly
                            ? 'bg-blue-600 text-white border-blue-500 font-bold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        30% Doc
                      </button>
                      <button
                        onClick={() => {
                          setSplitLayout('50/50');
                          setSplitPercent(50);
                        }}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          splitPercent > 40 && splitPercent < 60 && !isReaderOnly && !isCanvasOnly
                            ? 'bg-blue-600 text-white border-blue-500 font-bold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        50/50
                      </button>
                      <button
                        onClick={() => {
                          setSplitLayout('70/30');
                          setSplitPercent(70);
                        }}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          splitPercent >= 65 && !isReaderOnly && !isCanvasOnly
                            ? 'bg-blue-600 text-white border-blue-500 font-bold'
                            : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        70% Doc
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1 text-[11px]">
                      <button
                        onClick={() => setSplitLayout(isReaderOnly ? '50/50' : 'reader-only')}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          isReaderOnly ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isReaderOnly ? 'Restore Split' : 'Full Doc'}
                      </button>
                      <button
                        onClick={() => setSplitLayout(isCanvasOnly ? '50/50' : 'canvas-only')}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          isCanvasOnly ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isCanvasOnly ? 'Restore Split' : 'Full Map'}
                      </button>
                    </div>
                  </div>

                  {/* Eye-Care PDF Display Filter */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      PDF Page Filter
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {[
                        { id: 'normal', label: '☀️ Natural' },
                        { id: 'sepia', label: '📜 Warm Sepia' },
                        { id: 'dark-invert', label: '🌙 Dark Invert' },
                        { id: 'soft-contrast', label: '🌑 Soft Contrast' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => updateAppSettings({ pdfColorFilter: f.id as any })}
                          className={`p-2 rounded-xl border text-left transition font-medium ${
                            appSettings.pdfColorFilter === f.id
                              ? 'bg-blue-600 text-white border-blue-500 font-bold'
                              : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas Page Design */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Canvas Background Pattern
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {[
                        { id: 'dots', label: '· Dot Grid' },
                        { id: 'graph', label: '# Blueprint' },
                        { id: 'cornell', label: '📝 Cornell' },
                        { id: 'minimal', label: '📄 Minimal' },
                        { id: 'nebula', label: '🌌 Nebula' },
                        { id: 'sepia', label: '📜 Parchment' }
                      ].map(d => (
                        <button
                          key={d.id}
                          onClick={() => updateAppSettings({ canvasDesign: d.id as any })}
                          className={`p-2 rounded-xl border text-left transition font-medium ${
                            appSettings.canvasDesign === d.id
                              ? 'bg-blue-600 text-white border-blue-500 font-bold'
                              : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Size */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Document Font Sizing
                    </label>
                    <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                      {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => updateAppSettings({ defaultFontSize: size })}
                          className={`flex-1 py-1 rounded-lg transition uppercase font-semibold text-center ${
                            appSettings.defaultFontSize === size
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI ASSISTANT */}
              {activeRightTab === 'ai' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 text-slate-200 space-y-1">
                    <span className="font-semibold text-white block">Grounded Document Intelligence</span>
                    <p className="text-[11px] text-slate-300">
                      Answers are grounded exclusively in your documents with verified citations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Quick Analysis Prompts
                    </span>
                    {[
                      '⚡ Synthesize core arguments & evidence',
                      '⚖️ Extract mutual indemnification & liability caps',
                      '📊 Find statistical benchmarks & cohort metrics',
                      '❓ Generate critical counter-inquiries'
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => onOpenChat()}
                        className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-blue-500/40 text-slate-200 text-left text-xs transition flex items-center justify-between group"
                      >
                        <span className="truncate">{prompt}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onOpenChat()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-apple-glow flex items-center justify-center space-x-2 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Full AI Research Chat</span>
                  </button>
                </div>
              )}

              {/* TAB 3: EXPORT */}
              {activeRightTab === 'export' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-slate-200 space-y-1">
                    <span className="font-semibold text-emerald-300 block">Executive Memo Generator</span>
                    <p className="text-[11px] text-slate-300">
                      Convert your mind map cards and citations into a formatted client brief or research paper.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenExecutiveReport) onOpenExecutiveReport();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-apple-glow flex items-center justify-center space-x-2 transition"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Generate Executive Brief</span>
                  </button>

                  <button
                    onClick={() => {
                      const summary = nodes.map(n => `### ${n.title}\n${n.content}\n*Citation: Page ${n.anchors[0]?.pageNumber || 1}*`).join('\n\n');
                      navigator.clipboard.writeText(summary);
                      alert('Copied Markdown synthesis with citations to clipboard!');
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copy Markdown Synthesis</span>
                  </button>
                </div>
              )}

              {/* TAB 4: SHARE */}
              {activeRightTab === 'share' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Active Collaborators ({collaborators.length})
                    </span>
                    {collaborators.map(c => (
                      <div
                        key={c.id}
                        className="p-2 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-white block leading-tight">{c.name}</span>
                            <span className="text-[10px] text-slate-400 block">{c.role}</span>
                          </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm animate-pulse"></span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onOpenShare()}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-apple-glow flex items-center justify-center space-x-2 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Invite Team Members</span>
                  </button>
                </div>
              )}

              {/* TAB 5: INSPECTOR */}
              {activeRightTab === 'inspector' && (
                <div className="space-y-3 text-xs">
                  {selectedNode ? (
                    <>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Card Title
                        </span>
                        <p className="font-semibold text-white">{selectedNode.title}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Exact Quote Anchor
                        </span>
                        <p className="text-slate-300 italic p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] leading-relaxed">
                          "{selectedNode.content}"
                        </p>
                      </div>

                      {selectedNode.anchors[0] && (
                        <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1 text-[11px] text-blue-300">
                          <div className="font-semibold">{selectedNode.anchors[0].docTitle}</div>
                          <div>Page {selectedNode.anchors[0].pageNumber} · Char {selectedNode.anchors[0].charRange.start}–{selectedNode.anchors[0].charRange.end}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Select any card on the Mind Map canvas to inspect its citations.
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* RIGHT-HAND VERTICAL PRODUCTIVITY ICON RAIL (Ultra-Clean 46px Dock) */}
        <div className="w-12 h-full glass-panel border-l border-white/10 flex flex-col items-center py-3 space-y-3 shrink-0 z-40 bg-black/40">
          <button
            onClick={() => setActiveRightTab(activeRightTab === 'settings' ? 'none' : 'settings')}
            className={`p-2.5 rounded-xl transition ${
              activeRightTab === 'settings'
                ? 'bg-blue-600 text-white shadow-apple-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Quick Settings & Workspace Layout"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveRightTab(activeRightTab === 'ai' ? 'none' : 'ai')}
            className={`p-2.5 rounded-xl transition ${
              activeRightTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-apple-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="AI Document Intelligence Assistant"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </button>

          <button
            onClick={() => setActiveRightTab(activeRightTab === 'export' ? 'none' : 'export')}
            className={`p-2.5 rounded-xl transition ${
              activeRightTab === 'export'
                ? 'bg-emerald-600 text-white shadow-apple-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Export Formatted Summary & Brief"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setActiveRightTab(activeRightTab === 'share' ? 'none' : 'share')}
            className={`p-2.5 rounded-xl transition ${
              activeRightTab === 'share'
                ? 'bg-cyan-600 text-white shadow-apple-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Team Collaboration & Share"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="w-6 h-px bg-white/15 my-1"></div>

          <button
            onClick={() => setActiveRightTab(activeRightTab === 'inspector' ? 'none' : 'inspector')}
            className={`p-2.5 rounded-xl transition ${
              activeRightTab === 'inspector'
                ? 'bg-amber-500 text-black shadow-apple-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Card & Citation Inspector"
          >
            <Info className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
