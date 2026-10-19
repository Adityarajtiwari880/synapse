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
  Quote,
  Sun,
  Moon
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { navigateTo, isTabletLayout, appSettings, updateAppSettings } = useWorkspace();
  const { isAuthenticated, currentUser } = useAuth();

  const isLight = appSettings.theme === 'light';
  const toggleTheme = () => updateAppSettings({ theme: isLight ? 'dark' : 'light' });

  // Interactive Hero Demo state
  const [heroSqueezed, setHeroSqueezed] = useState(false);
  const [activeTab, setActiveTab] = useState<'legal' | 'medical' | 'finance' | 'research'>('legal');

  // Dynamic theme class helpers
  const bg = isLight ? 'bg-[#f4f6f9]' : 'bg-[#090a10]';
  const textBase = isLight ? 'text-slate-900' : 'text-slate-100';
  const navBg = isLight ? 'bg-white/95 border-slate-200 shadow-sm' : 'bg-[#090a10]/80 border-white/10';
  const navText = isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white';
  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300' : 'bg-white/[0.03] border-white/10 hover:border-blue-500/50';
  const subText = isLight ? 'text-slate-600' : 'text-slate-400';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const sectionBg = isLight ? 'bg-slate-50' : 'bg-[#090a10]';
  const footerBg = isLight ? 'bg-white border-slate-200' : 'bg-[#090a10] border-white/10';

  return (
    <div className={`min-h-screen ${bg} ${textBase} flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden`}>
      {/* iOS LIQUID GLASS NAV BAR */}
      <nav className="sticky top-0 z-50 ios-glass border-b px-4 sm:px-8 py-3 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('landing')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-lg tracking-tight ${headingText}`}>Synapse</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                Spatial Pro
              </span>
            </div>
          </div>

          {/* Simple, Beginner-Friendly Navigation Links */}
          <div className={`hidden lg:flex items-center space-x-7 text-xs font-semibold ${navText}`}>
            <button onClick={() => navigateTo('dashboard')} className="hover:text-blue-500 transition">
              My Documents
            </button>
            <button onClick={() => navigateTo('matrix')} className="hover:text-blue-500 transition">
              Compare Table
            </button>
            <button onClick={() => navigateTo('trust')} className="hover:text-blue-500 transition">
              Privacy &amp; Safety
            </button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-blue-500 transition">
              Pricing
            </button>
            <button onClick={() => navigateTo('docs')} className="hover:text-blue-500 transition">
              How It Works
            </button>
          </div>

          {/* iOS Glass Controls: Day/Night Toggle, Log In & Register Buttons */}
          <div className="flex items-center space-x-2">
            {/* Day / Night Toggle */}
            <button
              onClick={toggleTheme}
              className="ios-glass-btn p-2 sm:px-3 sm:py-1.5 flex items-center space-x-1.5 text-xs font-semibold"
              title={isLight ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            >
              {isLight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline">{isLight ? 'Night' : 'Day'}</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigateTo('dashboard')}
                className="ios-glass-btn px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>{currentUser?.name.split(' ')[0]}'s Workspace</span>
              </button>
            ) : (
              <>
                {/* Simple Login Button in Glass Texture */}
                <button
                  onClick={() => navigateTo('auth')}
                  className="ios-glass-btn px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1"
                  title="Sign In with your account"
                >
                  <span>Log In</span>
                </button>

                {/* Register Button in Glass Texture */}
                <button
                  onClick={() => navigateTo('auth')}
                  className="ios-glass-btn-primary px-3.5 sm:px-4 py-1.5 text-xs font-bold flex items-center space-x-1.5 shadow-apple-glow"
                  title="Create a free account"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                </button>
              </>
            )}

            {/* Direct Open Workspace Button */}
            <button
              onClick={() => navigateTo('workspace')}
              className="hidden sm:flex ios-glass-btn px-3 py-1.5 text-xs font-semibold text-blue-500 items-center space-x-1"
              title="Open the Reading Board immediately"
            >
              <span>Workspace</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-14 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-cyan-400/20 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Simple Beginner-Friendly Badge */}
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-sm text-xs font-semibold ${
            isLight ? 'bg-blue-50/80 border-blue-200 text-blue-600' : 'bg-white/10 border-white/15 text-cyan-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>A simpler, smarter way to read PDFs &amp; connect ideas</span>
          </div>

          {/* High-Contrast Title (Legible in both Light & Dark modes) */}
          <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] ${headingText}`}>
            Go past the limits of paper.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              See the connections others miss.
            </span>
          </h1>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed ${subText}`}>
            Read long documents with speed and ease. Pull key quotes onto an open visual board, connect ideas with a tap, and collapse unneeded pages with a simple pinch.
          </p>

          {/* Primary Action Row with iOS Glass Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => navigateTo('auth')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl ios-glass-btn-primary font-bold text-sm shadow-apple-glow flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => navigateTo('workspace')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl ios-glass-btn font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Open Sample Document</span>
            </button>
          </div>

          {/* 4 Simple Value Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 border-t text-left ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}>
            <div className="ios-glass-card p-4">
              <div className={`text-2xl sm:text-3xl font-extrabold ${headingText}`}>4+ Hours</div>
              <div className={`text-xs mt-1 ${subText}`}>Saved every week on heavy reading</div>
            </div>
            <div className="ios-glass-card p-4">
              <div className={`text-2xl sm:text-3xl font-extrabold text-blue-500`}>Smooth</div>
              <div className={`text-xs mt-1 ${subText}`}>Fast zoom &amp; scroll without lag</div>
            </div>
            <div className="ios-glass-card p-4">
              <div className={`text-2xl sm:text-3xl font-extrabold text-indigo-500`}>1-Click</div>
              <div className={`text-xs mt-1 ${subText}`}>Jump straight to any note's page</div>
            </div>
            <div className="ios-glass-card p-4">
              <div className={`text-2xl sm:text-3xl font-extrabold text-emerald-500`}>100%</div>
              <div className={`text-xs mt-1 ${subText}`}>Private &amp; saved on your device</div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE WORKSPACE SIMULATOR WIDGET */}
        <div className="max-w-6xl mx-auto mt-14 relative z-10">
          <div className="ios-glass-card p-2 sm:p-3 overflow-hidden shadow-2xl">
            <div className="rounded-2xl bg-[#0c0d16] border border-white/10 overflow-hidden shadow-2xl">
              {/* Window Header */}
              <div className="h-10 px-4 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">Synapse · Live Interactive Reading Board</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
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
                        <div className="text-xs font-semibold text-white">Sample Contract Agreement</div>
                        <div className="text-[10px] text-slate-400">Services Agreement · Page 4 of 18</div>
                      </div>
                      <button
                        onClick={() => setHeroSqueezed(prev => !prev)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition flex items-center space-x-1.5 ${
                          heroSqueezed
                            ? 'bg-blue-600 text-white shadow-apple-glow'
                            : 'ios-glass-btn text-slate-200'
                        }`}
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>{heroSqueezed ? 'Show All Text' : '⚡ Fold / Squeeze'}</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                      <div className="p-3 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-200">
                        <span className="text-[10px] font-bold uppercase text-yellow-400 block mb-0.5">Key Clause 1 — Indemnity</span>
                        "Provider shall indemnify, defend, and hold harmless Customer against third-party claims without aggregate liability caps."
                      </div>

                      {heroSqueezed ? (
                        <div className="py-2 flex items-center justify-center">
                          <div className="h-7 w-full rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center space-x-2 text-[10px] text-blue-300 font-mono animate-pulse">
                            <span>--- [14 unneeded paragraphs folded together] ---</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[11px] p-2 bg-white/[0.02] rounded-lg border border-white/5">
                          Standard filler paragraphs, payment definitions, invoicing intervals, and routine boilerplate clauses...
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-200">
                        <span className="text-[10px] font-bold uppercase text-blue-400 block mb-0.5">Key Clause 2 — Liability Exclusion</span>
                        "Neither party's limitation of liability shall apply to gross negligence, willful misconduct, or breach of confidentiality."
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5">
                    <span>💡 Tap "Fold / Squeeze" to hide unneeded text</span>
                    <span className="text-cyan-400 font-semibold">2 Highlights Linked</span>
                  </div>
                </div>

                {/* Right: Notes Board with Cards & AI */}
                <div className="p-5 relative overflow-hidden flex flex-col justify-between bg-radial-gradient">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Connected Notes Board</span>
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Interactive &amp; Ready</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 relative">
                      <div className="p-3 rounded-2xl bg-white/5 border border-blue-500/30 shadow-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-400">UNLIMITED INDEMNITY</span>
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        </div>
                        <p className="text-[11px] text-slate-200">
                          IP claims bypass the standard ceiling. High exposure risk.
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/5 border border-purple-500/30 shadow-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-400">CARVE-OUT EXCEPTION</span>
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        </div>
                        <p className="text-[11px] text-slate-200">
                          Gross negligence provision directly matches the indemnity exception.
                        </p>
                      </div>
                    </div>

                    {/* AI Citation card */}
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold text-cyan-300">AI Assistant Summary</div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          "Mutual liability is limited to \$2.5M, but Section 8.2 creates uncapped indemnity for third-party copyright claims."
                        </p>
                        <span className="inline-block mt-1.5 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          [Page 4, §8.2]
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => navigateTo('workspace')}
                      className="ios-glass-btn-primary text-xs font-bold px-5 py-2.5 inline-flex items-center space-x-2 shadow-apple-glow cursor-pointer"
                    >
                      <span>Open Reading Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SYNAPSE SURPASSES PAPER */}
      <section className={`py-20 px-4 sm:px-8 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#07080e]'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-500">Why It's Better</h2>
            <p className={`text-3xl sm:text-4xl font-extrabold ${headingText}`}>A Better Way to Read Complex Documents</p>
            <p className={`text-sm ${subText}`}>
              Physical paper scatters your notes. Basic PDF readers make you flip back and forth. Synapse lets you see connected ideas side-by-side on an open visual board.
            </p>
          </div>

          <div className="ios-glass-card overflow-x-auto p-4 sm:p-6">
            <table className={`w-full text-left border-collapse text-xs`}>
              <thead>
                <tr className={`border-b font-semibold uppercase tracking-wider ${isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400'}`}>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Regular PDF Reader</th>
                  <th className="py-3 px-4">Paper Binders</th>
                  <th className={`py-3 px-4 font-bold border-l border-r ${isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-300 bg-blue-600/10 border-blue-500/20'}`}>
                    Synapse
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-600' : 'divide-white/5 text-slate-300'}`}>
                <tr>
                  <td className={`py-3 px-4 font-semibold ${headingText}`}>Collapse Pages (Squeeze)</td>
                  <td className="py-3 px-4 text-slate-400">No</td>
                  <td className="py-3 px-4 text-slate-400">No (folds physically)</td>
                  <td className={`py-3 px-4 font-semibold border-l border-r ${isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-300 bg-blue-600/10 border-blue-500/20'}`}>
                    Pinch to fold blank pages &amp; see highlights side-by-side
                  </td>
                </tr>
                <tr>
                  <td className={`py-3 px-4 font-semibold ${headingText}`}>Visual Notes Board</td>
                  <td className="py-3 px-4 text-slate-400">Tiny comment margin only</td>
                  <td className="py-3 px-4 text-slate-400">Scattered sticky notes</td>
                  <td className={`py-3 px-4 font-semibold border-l border-r ${isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-300 bg-blue-600/10 border-blue-500/20'}`}>
                    Infinite canvas with 1-click jump back to PDF page
                  </td>
                </tr>
                <tr>
                  <td className={`py-3 px-4 font-semibold ${headingText}`}>Grounded AI Assistant</td>
                  <td className="py-3 px-4 text-slate-400">Generic chatbot</td>
                  <td className="py-3 px-4 text-slate-400">None</td>
                  <td className={`py-3 px-4 font-semibold border-l border-r ${isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-300 bg-blue-600/10 border-blue-500/20'}`}>
                    Answers grounded directly in your PDF with exact citations
                  </td>
                </tr>
                <tr>
                  <td className={`py-3 px-4 font-semibold ${headingText}`}>Touch, Stylus &amp; Mouse</td>
                  <td className="py-3 px-4 text-slate-400">Mouse only</td>
                  <td className="py-3 px-4 text-emerald-500">Pen only</td>
                  <td className={`py-3 px-4 font-semibold border-l border-r ${isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-300 bg-blue-600/10 border-blue-500/20'}`}>
                    Native Apple Pencil inking, touch gestures, and mouse
                  </td>
                </tr>
                <tr>
                  <td className={`py-3 px-4 font-semibold ${headingText}`}>Privacy &amp; Safety</td>
                  <td className="py-3 px-4 text-slate-400">Uploaded to third-party servers</td>
                  <td className="py-3 px-4 text-slate-400">Physical loss risk</td>
                  <td className={`py-3 px-4 font-semibold border-l border-r ${isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-300 bg-blue-600/10 border-blue-500/20'}`}>
                    100% on your device · Your files never leave your browser
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SOLUTIONS BY INDUSTRY */}
      <section className={`py-20 px-4 sm:px-8 ${isLight ? 'bg-white/80' : 'bg-[#090a11]'}`}>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-500">Made For Your Work</h2>
            <p className={`text-3xl sm:text-4xl font-extrabold ${headingText}`}>Tailored To How You Read &amp; Research</p>
          </div>

          {/* Industry Tabs */}
          <div className="flex justify-center">
            <div className={`inline-flex p-1.5 rounded-2xl border space-x-2 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <button
                onClick={() => setActiveTab('legal')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'legal' ? 'bg-blue-600 text-white shadow-apple-glow' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Legal &amp; Contracts</span>
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'medical' ? 'bg-blue-600 text-white shadow-apple-glow' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Medical &amp; Health</span>
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'finance' ? 'bg-blue-600 text-white shadow-apple-glow' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Business &amp; Finance</span>
              </button>
              <button
                onClick={() => setActiveTab('research')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'research' ? 'bg-blue-600 text-white shadow-apple-glow' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Research &amp; Study</span>
              </button>
            </div>
          </div>

          {/* Industry Details Card */}
          <div className="ios-glass-card p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              {activeTab === 'legal' && (
                <>
                  <div className="text-xs uppercase font-bold text-amber-500 tracking-wider">Legal &amp; Contracts</div>
                  <h3 className={`text-2xl font-bold ${headingText}`}>Review Contracts &amp; Spot Critical Risks Faster</h3>
                  <p className={`text-sm leading-relaxed ${subText}`}>
                    Compare agreements side-by-side. Extract clauses onto an open visual board, connect indemnity rules to liability caps, and export a clean Word document report with 1 click.
                  </p>
                  <ul className={`space-y-2 text-xs ${subText}`}>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Compare two clauses side-by-side without flipping back and forth</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Click any note on your board to jump straight to the source paragraph</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'medical' && (
                <>
                  <div className="text-xs uppercase font-bold text-emerald-500 tracking-wider">Clinical &amp; Healthcare</div>
                  <h3 className={`text-2xl font-bold ${headingText}`}>Digest Clinical Trials &amp; Study Protocols in Minutes</h3>
                  <p className={`text-sm leading-relaxed ${subText}`}>
                    Review hundreds of study pages effortlessly. Use page squeezing to isolate dosage tables, patient criteria, and outcomes side-by-side.
                  </p>
                  <ul className={`space-y-2 text-xs ${subText}`}>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Compare study results side-by-side in a clean table</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>100% private on-device reading ensures sensitive data stays confidential</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'finance' && (
                <>
                  <div className="text-xs uppercase font-bold text-cyan-500 tracking-wider">Business &amp; Finance</div>
                  <h3 className={`text-2xl font-bold ${headingText}`}>Analyze Financial Reports &amp; Deals Without Friction</h3>
                  <p className={`text-sm leading-relaxed ${subText}`}>
                    Break down complex 10-K filings, pitch decks, and agreements. Pull key numbers and covenants onto your board to see trends clearly.
                  </p>
                  <ul className={`space-y-2 text-xs ${subText}`}>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Highlight and extract financial definitions onto your board</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Export clean executive briefing notes in seconds</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'research' && (
                <>
                  <div className="text-xs uppercase font-bold text-purple-500 tracking-wider">Academic &amp; Research</div>
                  <h3 className={`text-2xl font-bold ${headingText}`}>Supercharge Literature Reviews &amp; Thesis Reading</h3>
                  <p className={`text-sm leading-relaxed ${subText}`}>
                    Read multiple scientific papers without drowning in browser tabs. Draw diagrams with Apple Pencil and build a visual map of citations.
                  </p>
                  <ul className={`space-y-2 text-xs ${subText}`}>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Export notes to Obsidian Markdown or clean PDF summaries</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Ask AI questions across multiple open documents at once</span>
                    </li>
                  </ul>
                </>
              )}

              <div className="pt-3">
                <button
                  onClick={() => navigateTo('workspace')}
                  className="ios-glass-btn px-5 py-2.5 text-xs font-semibold inline-flex items-center space-x-1.5"
                >
                  <span>Try It In Reading Board</span>
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
              <Quote className="w-6 h-6 text-blue-500 opacity-60" />
              <p className={`text-xs italic leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                {activeTab === 'legal' &&
                  "\"The fastest way to review a long contract once and create clean notes that I can jump back to with 1 click. Truly brilliant.\""}
                {activeTab === 'medical' &&
                  "\"I'm doing things that used to take 100 printed pages and 4 highlighters. It completely clears the clutter.\""}
                {activeTab === 'finance' &&
                  "\"Saved me about 4 hours every week reviewing agreements and financial reports.\""}
                {activeTab === 'research' &&
                  "\"Reading complex literature and connecting formulas on an open board makes studying enjoyable again.\""}
              </p>
              <div className={`border-t pt-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <div className={`text-xs font-bold ${headingText}`}>
                  {activeTab === 'legal' && 'B.H. · Legal Counsel'}
                  {activeTab === 'medical' && 'Dr. J.H. · Clinical Researcher'}
                  {activeTab === 'finance' && 'P.H. · Acquisition Director'}
                  {activeTab === 'research' && 'A.R. · University Researcher'}
                </div>
                <div className={`text-[10px] ${subText}`}>Verified User</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className={`py-20 px-4 sm:px-8 relative overflow-hidden ${isLight ? 'bg-gradient-to-b from-slate-100 to-slate-200' : 'bg-gradient-to-b from-[#090a11] to-[#040508]'}`}>
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${headingText}`}>
            Ready to read and take notes without limits?
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${subText}`}>
            Works directly in your browser with no installation needed. 100% private and free to try.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigateTo('workspace')}
              className="ios-glass-btn-primary px-8 py-3.5 font-bold text-sm shadow-apple-glow flex items-center justify-center space-x-2"
            >
              <span>Open Reading Board Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('auth')}
              className="ios-glass-btn px-6 py-3.5 font-semibold text-sm flex items-center justify-center space-x-2"
            >
              <span>Log In / Create Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-12 px-4 sm:px-8 text-xs ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#05060a] border-white/10 text-slate-400'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className={`font-bold text-base ${headingText}`}>Synapse</span>
            </div>
            <p className={`text-xs max-w-sm ${subText}`}>
              The simple, powerful visual reading and notes platform. Connect quotes, collapse unneeded pages, and understand your documents faster.
            </p>
            <div className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              © 2026 Synapse Technologies. All rights reserved.
            </div>
          </div>

          <div>
            <h4 className={`font-semibold uppercase tracking-wider text-[11px] mb-3 ${headingText}`}>Features</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('workspace')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Reading Board</button></li>
              <li><button onClick={() => navigateTo('dashboard')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>My Documents</button></li>
              <li><button onClick={() => navigateTo('matrix')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Compare Table</button></li>
              <li><button onClick={() => navigateTo('pricing')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold uppercase tracking-wider text-[11px] mb-3 ${headingText}`}>Safety</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('trust')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Privacy &amp; Security</button></li>
              <li><button onClick={() => navigateTo('trust')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Device Storage</button></li>
              <li><button onClick={() => navigateTo('trust')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Zero Tracking</button></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold uppercase tracking-wider text-[11px] mb-3 ${headingText}`}>Help</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigateTo('docs')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>How It Works</button></li>
              <li><button onClick={() => navigateTo('docs')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>Keyboard &amp; Touch Shortcuts</button></li>
              <li><button onClick={() => navigateTo('docs')} className={`transition ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>AI Assistant Guide</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

