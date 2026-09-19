import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileText,
  Maximize2,
  Lock,
  ChevronRight,
  Tablet,
  Laptop,
  Feather,
  GitBranch,
  Scale,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Play,
  FileDown,
  Quote
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { navigateTo, isTabletLayout } = useWorkspace();
  const { isAuthenticated, currentUser } = useAuth();

  // Interactive Hero Demo state
  const [heroSqueezed, setHeroSqueezed] = useState(false);
  const [activeTab, setActiveTab] = useState<'legal' | 'medical' | 'finance' | 'research'>('legal');

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      {/* GLOSSY NAV BAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a10]/80 border-b border-white/10 px-4 sm:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('landing')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">Synapse</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Spatial Pro
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-7 text-xs font-medium text-slate-300">
            <button onClick={() => navigateTo('dashboard')} className="hover:text-white transition">
              Dossiers & Matters
            </button>
            <button onClick={() => navigateTo('matrix')} className="hover:text-white transition">
              Synthesis Matrix
            </button>
            <button onClick={() => navigateTo('trust')} className="hover:text-white transition">
              Trust & Security
            </button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-white transition">
              Pricing
            </button>
            <button onClick={() => navigateTo('docs')} className="hover:text-white transition">
              Documentation
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigateTo('dashboard')}
                className="text-xs font-medium px-3.5 py-1.5 rounded-xl border border-white/15 text-white hover:bg-white/10 transition"
              >
                {currentUser?.name.split(' ')[0]}'s Hub
              </button>
            ) : (
              <button
                onClick={() => navigateTo('auth')}
                className="text-xs font-medium px-3.5 py-1.5 rounded-xl text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => navigateTo('workspace')}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-apple-glow transition flex items-center space-x-1.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 px-4 sm:px-8 overflow-hidden">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-cyan-400/20 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-inner text-xs font-medium text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Industrial-Grade Spatial Research · Far Beyond LiquidText & Paper</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Go past the limits of paper.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              See the connections others miss.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Review complex agreements, clinical protocols, and scientific papers with the speed of thought.
            Pinch documents to squeeze out irrelevant text, extract ideas onto an infinite synthesis canvas, and let grounded AI verify every fact with verbatim citations.
          </p>

          {/* Primary Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => navigateTo('workspace')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-apple-glow hover:brightness-110 active:scale-95 transition flex items-center justify-center space-x-2 group"
            >
              <span>Launch Spatial Studio Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-sm backdrop-blur-lg active:scale-95 transition flex items-center justify-center space-x-2"
            >
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Explore Enterprise Dossiers</span>
            </button>
          </div>

          {/* Value Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 border-t border-white/10 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">4.2 hrs</div>
              <div className="text-xs text-slate-400">Average weekly time saved per professional</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">60 FPS</div>
              <div className="text-xs text-slate-400">Hardware pan/zoom over 2,000+ spatial nodes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400">Verifiable quotes with exact page quad anchors</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">0 Bytes</div>
              <div className="text-xs text-slate-400">Cloud retention · 100% local-first on client hardware</div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE WORKSPACE SIMULATOR WIDGET */}
        <div className="max-w-6xl mx-auto mt-14 relative z-10">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-2xl backdrop-blur-2xl">
            <div className="rounded-[22px] bg-[#0c0d16] border border-white/10 overflow-hidden shadow-2xl">
              {/* Window Header */}
              <div className="h-10 px-4 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 ml-2">Synapse Spatial Pro · Live Interactive Simulator</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Interactive Preview
                  </span>
                </div>
              </div>

              {/* Interactive Split Reading & Canvas Demo */}
              <div className="grid grid-cols-1 md:grid-cols-2 h-[420px] bg-[#07080f]">
                {/* Left: Document Reader with Liquid Squeeze Control */}
                <div className="border-r border-white/10 p-5 flex flex-col justify-between overflow-y-auto bg-black/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div>
                        <div className="text-xs font-semibold text-white">Master Cloud Services Agreement</div>
                        <div className="text-[10px] text-slate-400">Apex Global Holdings Ltd. · Page 4 of 18</div>
                      </div>
                      <button
                        onClick={() => setHeroSqueezed(prev => !prev)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                          heroSqueezed
                            ? 'bg-blue-600 text-white shadow-apple-glow'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>{heroSqueezed ? 'Expand Full Text' : '⚡ Pinch Squeeze'}</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                      <div className="p-2.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-200">
                        <span className="text-[10px] font-bold uppercase text-yellow-400 block mb-0.5">Section 8.2 — Mutual Indemnity</span>
                        "Provider shall indemnify, defend, and hold harmless Customer against any third-party claims alleging infringement of patent or copyright without aggregate liability caps."
                      </div>

                      {heroSqueezed ? (
                        <div className="py-2 flex items-center justify-center">
                          <div className="h-6 w-full rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center space-x-2 text-[10px] text-blue-300 font-mono animate-pulse">
                            <span>--- [14 unhighlighted paragraphs squeezed into fold] ---</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[11px] p-2 bg-white/[0.02] rounded border border-white/5">
                          Standard boilerplate definitions of terms, payment mechanisms, invoicing intervals, tax jurisdiction clauses, and governing law clauses...
                        </div>
                      )}

                      <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-200">
                        <span className="text-[10px] font-bold uppercase text-blue-400 block mb-0.5">Section 12.4 — Gross Negligence Exclusion</span>
                        "Neither party's limitation of liability under Section 12.1 shall apply to gross negligence, willful misconduct, or breach of confidentiality under Exhibit B."
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-white/5">
                    <span>💡 Tap "Pinch Squeeze" to watch accordion fold in action</span>
                    <span className="text-cyan-400 font-mono">2 Key Clauses Found</span>
                  </div>
                </div>

                {/* Right: Spatial Canvas with Nodes & Bézier Curves */}
                <div className="p-5 relative overflow-hidden flex flex-col justify-between bg-radial-gradient">
                  {/* Visual Nodes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Spatial Synthesis Canvas</span>
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>60 FPS Active</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 relative">
                      <div className="p-3 rounded-xl bg-white/5 border border-blue-500/40 shadow-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-blue-400">UNLIMITED INDEMNITY</span>
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        </div>
                        <p className="text-[11px] text-slate-200">
                          IP claims bypass 1x ARR ceiling. Potential high exposure for licensor.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-purple-500/40 shadow-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-purple-400">CARVE-OUT OVERLAP</span>
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        </div>
                        <p className="text-[11px] text-slate-200">
                          Gross negligence provision aligns with indemnity exception.
                        </p>
                      </div>
                    </div>

                    {/* Grounded AI Citation pill */}
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-semibold text-cyan-300">Grounded AI Synthesis</div>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          "Mutual liability is bounded at \$2.5M direct damages, but Section 8.2 creates uncapped indemnity for third-party IP infringement."
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          [Contract p. 4, §8.2]
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => navigateTo('workspace')}
                      className="text-xs font-semibold text-white px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 transition inline-flex items-center space-x-1.5 shadow-apple-glow"
                    >
                      <span>Open Full Interactive Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SYNAPSE SURPASSES LIQUIDTEXT & PAPER */}
      <section className="py-20 px-4 sm:px-8 border-t border-white/10 bg-[#07080e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">Beyond Traditional Tools</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Why Professionals Choose Synapse Pro</p>
            <p className="text-sm text-slate-400">
              Traditional paper scatters your thoughts. Proprietary note apps lock your data into silos. Synapse gives you complete spatial mastery with open, local-first power.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Capability</th>
                  <th className="py-4 px-4 text-slate-400">LiquidText</th>
                  <th className="py-4 px-4 text-slate-400">Physical Paper</th>
                  <th className="py-4 px-4 text-cyan-300 font-bold bg-blue-600/10 border-l border-r border-blue-500/20">
                    Synapse Spatial Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Document Squeeze</td>
                  <td className="py-3.5 px-4 text-slate-400">Basic pinch</td>
                  <td className="py-3.5 px-4 text-red-400/80">Impossible (folds physically)</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-blue-600/10 border-l border-r border-blue-500/20">
                    Two-Mode (Pinch Highlights + Pinch Query Search)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Device Adaptation</td>
                  <td className="py-3.5 px-4 text-slate-400">iPad-centric; cramped desktop</td>
                  <td className="py-3.5 px-4 text-slate-400">Heavy binders, desks only</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-blue-600/10 border-l border-r border-blue-500/20">
                    Native iPadOS Touch Bar vs. MacBook Resizable Sash
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Verifiable Grounded AI</td>
                  <td className="py-3.5 px-4 text-red-400/80">None / basic generic chat</td>
                  <td className="py-3.5 px-4 text-red-400/80">Manual cross-referencing</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-blue-600/10 border-l border-r border-blue-500/20">
                    Sentence-level quotes with 1-click synthesis cards
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Freehand Inking</td>
                  <td className="py-3.5 px-4 text-slate-400">Proprietary ink strokes</td>
                  <td className="py-3.5 px-4 text-emerald-400">Natural pen</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-blue-600/10 border-l border-r border-blue-500/20">
                    Retina 60 FPS inking + Apple Pencil pressure + palm reject
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Executive Deliverables</td>
                  <td className="py-3.5 px-4 text-slate-400">Proprietary project file</td>
                  <td className="py-3.5 px-4 text-slate-400">Scanning & retyping</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-blue-600/10 border-l border-r border-blue-500/20">
                    1-Click Word (.doc) Memos, Obsidian & JSON Canvas
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Data Privacy & Sovereignty</td>
                  <td className="py-3.5 px-4 text-slate-400">Cloud subscription servers</td>
                  <td className="py-3.5 px-4 text-yellow-400">Physical risk / leaks</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-blue-600/10 border-l border-r border-blue-500/20">
                    100% Local-first default · Zero Cloud Storage Lock-in
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SOLUTIONS BY INDUSTRY */}
      <section className="py-20 px-4 sm:px-8 bg-[#090a11]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">Tailored For Your Profession</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Engineered For High-Stakes Knowledge Work</p>
          </div>

          {/* Industry Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 space-x-2">
              <button
                onClick={() => setActiveTab('legal')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'legal' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Legal & Litigation</span>
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'medical' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Life Sciences & Clinical</span>
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'finance' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Private Equity & Due Diligence</span>
              </button>
              <button
                onClick={() => setActiveTab('research')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'research' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic & Science</span>
              </button>
            </div>
          </div>

          {/* Industry Details Card */}
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              {activeTab === 'legal' && (
                <>
                  <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">Corporate Counsel & Litigators</div>
                  <h3 className="text-2xl font-bold text-white">Extract M&A Indemnity Risks and Cross-Examine Depositions</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Compare purchase agreements and disclosure schedules side-by-side. Pull clauses onto the spatial canvas to map indemnity caps against carve-out exclusions. Export instant Word (.doc) legal memorandums for your client briefings with zero manual reformatting.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Pinpoint contradictory statements across multi-volume deposition transcripts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Two-way golden anchor flash jumping from memo cards back into agreement text</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'medical' && (
                <>
                  <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Physicians & Principal Investigators</div>
                  <h3 className="text-2xl font-bold text-white">Synthesize Clinical Protocols and FDA 510(k) Submissions</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Review hundreds of trial pages in minutes. Use Pinch Squeeze to isolate adverse event tables, dosage escalations, and exclusion criteria across multi-center protocols.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Side-by-side cohort outcome comparisons in the structured Synthesis Matrix</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>HIPAA-compliant on-device processing guarantees patient data never leaves hardware</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'finance' && (
                <>
                  <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Investment Banking & PE Analysts</div>
                  <h3 className="text-2xl font-bold text-white">Uncover Hidden Liabilities in Credit Agreements and 10-K Filings</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Dissect deal rooms in record time. Connect covenants, EBITDA definition adjustments, and debt baskets visually on an infinite canvas to reveal non-obvious deal risks.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Pinch Search to align covenant definitions across competing credit facilities</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Generate formatted Investment Committee briefing decks with verbatim anchors</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'research' && (
                <>
                  <div className="text-xs uppercase font-bold text-purple-400 tracking-wider">Scientists & PhD Researchers</div>
                  <h3 className="text-2xl font-bold text-white">Accelerate Literature Reviews and Mathematical Syntheses</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Synthesize dozen-paper literature corpuses without drowning in open browser tabs. Draw proof derivations with Apple Pencil and connect empirical results directly into the Synthesis Matrix.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Export directly to Obsidian Markdown and JSON Canvas for external Zettelkasten systems</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ask Library grounded AI assistant searches across entire PDF libraries simultaneously</span>
                    </li>
                  </ul>
                </>
              )}

              <div className="pt-3">
                <button
                  onClick={() => navigateTo('workspace')}
                  className="text-xs font-semibold px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition inline-flex items-center space-x-1.5"
                >
                  <span>Launch Preset For This Industry</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Quote Testimonial Card */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4">
              <Quote className="w-6 h-6 text-blue-400 opacity-60" />
              <p className="text-xs italic text-slate-200 leading-relaxed">
                {activeTab === 'legal' &&
                  "\"It's the fastest way I've come across to look at a document one time and make meaningful notes that I can quickly come back to. Really genius.\""}
                {activeTab === 'medical' &&
                  "\"The comprehension goes up... I'm doing things that would've taken me 100 pieces of paper and 4 highlighters before.\""}
                {activeTab === 'finance' &&
                  "\"I picked up about 4 hours per week in productivity reading and analyzing contract riders for our acquisitions.\""}
                {activeTab === 'research' &&
                  "\"This app is why you buy an iPad Pro and a MacBook together. Your ability to digest literature is given superpowers.\""}
              </p>
              <div className="border-t border-white/10 pt-3">
                <div className="text-xs font-bold text-white">
                  {activeTab === 'legal' && 'B.H. · Defense Litigation Partner, California'}
                  {activeTab === 'medical' && 'Dr. J.H. · Principal Clinical Investigator, Boston'}
                  {activeTab === 'finance' && 'P.H. · Corporate Acquisition Executive, Ohio'}
                  {activeTab === 'research' && 'A.R. · Postdoctoral Fellow, Cambridge'}
                </div>
                <div className="text-[10px] text-slate-400">Verified Professional User</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-8 relative overflow-hidden bg-gradient-to-b from-[#090a11] to-[#040508]">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to experience the future of reading?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Run it directly in your browser with zero install, zero cloud lock-in, and zero cost default.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('workspace')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-apple-glow hover:brightness-110 active:scale-95 transition flex items-center space-x-2"
            >
              <span>Launch Synapse Spatial Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('auth')}
              className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-sm transition"
            >
              Enterprise Sign In / SSO
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#05060a] py-12 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">Synapse Spatial Pro</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              The premier local-first spatial research and document synthesis platform for legal, medical, and strategic decision makers.
            </p>
            <div className="text-[11px] text-slate-500">
              © 2026 Synapse Technologies Inc. All rights reserved. Zero-Budget Local Architecture.
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Product</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('workspace')} className="hover:text-white transition">Spatial Workspace</button></li>
              <li><button onClick={() => navigateTo('dashboard')} className="hover:text-white transition">Dossiers & Matters</button></li>
              <li><button onClick={() => navigateTo('matrix')} className="hover:text-white transition">Synthesis Matrix</button></li>
              <li><button onClick={() => navigateTo('pricing')} className="hover:text-white transition">Enterprise Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Trust & Security</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('trust')} className="hover:text-white transition">Security Architecture</button></li>
              <li><button onClick={() => navigateTo('trust')} className="hover:text-white transition">SOC-2 Type II</button></li>
              <li><button onClick={() => navigateTo('trust')} className="hover:text-white transition">HIPAA Compliance</button></li>
              <li><button onClick={() => navigateTo('trust')} className="hover:text-white transition">Zero Retention Guarantee</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('docs')} className="hover:text-white transition">Gesture & Stylus Guide</button></li>
              <li><button onClick={() => navigateTo('docs')} className="hover:text-white transition">Keyboard Shortcuts</button></li>
              <li><button onClick={() => navigateTo('docs')} className="hover:text-white transition">Grounded AI Verification</button></li>
              <li><button onClick={() => navigateTo('admin')} className="hover:text-white transition">System Administration</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
