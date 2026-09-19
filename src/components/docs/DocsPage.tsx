import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Command,
  Search,
  Maximize2,
  Feather,
  Sparkles,
  FileDown,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Zap
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const DocsPage: React.FC = () => {
  const { navigateTo } = useWorkspace();
  const [selectedTopic, setSelectedTopic] = useState<'squeeze' | 'ink' | 'ai' | 'export' | 'shortcuts'>('squeeze');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-white/10 bg-[#0c0d16]/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center shadow-apple-glow">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight">Synapse Documentation</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase font-semibold">
                Knowledge Base
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Guides, Ergonomics & Reference Manual</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-3.5 py-1.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition"
          >
            Matters Hub
          </button>
          <button
            onClick={() => navigateTo('workspace')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-apple-glow transition flex items-center space-x-1.5"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Menu */}
        <aside className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-2">User Guides</div>
          <button
            onClick={() => setSelectedTopic('squeeze')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center space-x-2.5 ${
              selectedTopic === 'squeeze' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <span>Liquid Squeeze Engine</span>
          </button>
          <button
            onClick={() => setSelectedTopic('ink')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center space-x-2.5 ${
              selectedTopic === 'ink' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Feather className="w-4 h-4 text-emerald-400" />
            <span>Apple Pencil & Freehand Inking</span>
          </button>
          <button
            onClick={() => setSelectedTopic('ai')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center space-x-2.5 ${
              selectedTopic === 'ai' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Grounded AI & Citations</span>
          </button>
          <button
            onClick={() => setSelectedTopic('export')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center space-x-2.5 ${
              selectedTopic === 'export' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Executive Word (.doc) Export</span>
          </button>

          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 pt-6 mb-2">Reference</div>
          <button
            onClick={() => setSelectedTopic('shortcuts')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition flex items-center space-x-2.5 ${
              selectedTopic === 'shortcuts' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Command className="w-4 h-4 text-blue-400" />
            <span>Keyboard Shortcuts Cheatsheet</span>
          </button>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {selectedTopic === 'squeeze' && (
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  <Maximize2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">The Liquid Squeeze Engine</h2>
                  <p className="text-xs text-slate-400">Signature active reading breakthrough</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Reading lengthy contracts and academic papers traditionally forces you to flip back and forth between distant pages. Synapse's Liquid Squeeze collapses all unhighlighted or non-matching text into pleated accordion folds, bringing your key facts into direct juxtaposition.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-cyan-300">Mode A: Squeeze Highlights</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click "Squeeze Highlights" or pinch vertically on your iPad screen. The reader folds away all neutral paragraphs, displaying only marked evidence adjacent to one another.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-cyan-300">Mode B: Squeeze Query Search</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Type any keyword (e.g. "indemnification" or "cytokine") into the search box and tap "Squeeze". All passages containing your terms are accordion-folded into view simultaneously.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'ink' && (
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Feather className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Apple Pencil & Freehand Inking</h2>
                  <p className="text-xs text-slate-400">Retina 60 FPS drawing with hardware palm rejection</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Synapse features a hardware-accelerated SVG and canvas inking layer that captures Apple Pencil pressure (`e.pressure`) and coalesced touch events. Annotate margin notes, draw arrows, circle formulas, and underline text freely.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Active Palm Rejection:</strong> Resting your palm on the iPad screen will never trigger stray ink strokes or accidental zooming.
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Bézier Spline Smoothing:</strong> Jittery handwriting is automatically smoothed into elegant, crisp strokes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'ai' && (
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Grounded AI & Verifiable Citations</h2>
                  <p className="text-xs text-slate-400">Zero hallucinations guarantee</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Unlike consumer chatbots that invent facts, Synapse Grounded AI binds every single declarative statement to an exact verbatim quote and page coordinate (`[Doc A, p. 4]`).
              </p>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-2">
                <div className="font-bold text-cyan-300">1-Click "Place Answer on Canvas"</div>
                <p className="text-slate-300 leading-relaxed">
                  When the AI assistant answers your inquiry in the "Ask Library" drawer, tap "Place Answer on Canvas". The synthesis card drops directly onto your spatial matrix, permanently linked to the underlying source document.
                </p>
              </div>
            </div>
          )}

          {selectedTopic === 'export' && (
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Executive Word (.doc) & Obsidian Export</h2>
                  <p className="text-xs text-slate-400">From spatial matrix to client deliverable in 1 click</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Transform hours of spatial analysis into formatted deliverables. Synapse compiles your cards, quotes, and synthesis tables directly into structured Word `.doc` files, ready to email to clients, judges, or partners.
              </p>
            </div>
          )}

          {selectedTopic === 'shortcuts' && (
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Command className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Keyboard Shortcuts Cheatsheet</h2>
                  <p className="text-xs text-slate-400">Mac & Windows productivity accelerators</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase font-semibold">
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Mac Shortcut</th>
                      <th className="py-2.5 px-3">Windows Shortcut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white">Global Command Palette</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">⌘ + K</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">Ctrl + K</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white">Ask Library AI Co-Pilot</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">⌘ + J</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">Ctrl + J</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white">System Diagnostics & Debugger</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">⌘ + D</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">Ctrl + D</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white">Settings & Keys Enclave</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">⌘ + ,</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">Ctrl + ,</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white">Pan Spatial Canvas</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">Space + Drag</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">Space + Drag</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div
                className="p-3.5 rounded-xl bg-black/30 border border-white/10 cursor-pointer"
                onClick={() => toggleFaq(0)}
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Does Synapse upload my PDF files to third-party servers?</span>
                  {openFaq === 0 ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
                {openFaq === 0 && (
                  <p className="mt-2 text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                    No. Synapse operates on a strict local-first zero-budget architecture. Text extraction, vector embeddings, and spatial synthesis occur directly in your browser using WebAssembly and client-side hardware enclaves.
                  </p>
                )}
              </div>

              <div
                className="p-3.5 rounded-xl bg-black/30 border border-white/10 cursor-pointer"
                onClick={() => toggleFaq(1)}
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Can I use Apple Pencil on my iPad and continue on my MacBook?</span>
                  {openFaq === 1 ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
                {openFaq === 1 && (
                  <p className="mt-2 text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                    Yes. Synapse automatically detects your device hardware. On iPad, it enables touch targets and Apple Pencil pressure gestures. On Mac/Windows, it morphs into a resizable multi-column productivity workbench.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
