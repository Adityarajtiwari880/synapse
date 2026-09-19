import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Search,
  Sparkles,
  User,
  Shield,
  Activity,
  Columns,
  LogOut,
  Sliders,
  MessageSquareQuote,
  Share2,
  HelpCircle,
  FileCheck,
  Scale,
  GraduationCap,
  Briefcase,
  Stethoscope,
  BookOpen,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';


import { useAuth } from '../../context/AuthContext';
import { useWorkspace, ProfessionalField } from '../../context/WorkspaceContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenCommandPalette: () => void;
  onToggleDebugger: () => void;
  onToggleChat: () => void;
  onOpenQuickSettings: () => void;
  onOpenShare: () => void;
  onOpenGuide: () => void;
  onOpenExecutiveReport: () => void;
  isDebuggerOpen: boolean;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenCommandPalette,
  onToggleDebugger,
  onToggleChat,
  onOpenQuickSettings,
  onOpenShare,
  onOpenGuide,
  onOpenExecutiveReport,
  isDebuggerOpen,
  isChatOpen
}) => {
  const { currentUser, logout, canAccessAdmin } = useAuth();
  const {
    activeView,
    setActiveView,
    selectedDoc,
    activeField,
    switchField,
    splitLayout,
    setSplitLayout,
    ghostLayerActive,
    toggleGhostLayer,
    collaborators,
    isTabletLayout,
    appSettings,
    updateAppSettings
  } = useWorkspace();


  const cycleSplitLayout = () => {
    if (splitLayout === '50/50') setSplitLayout('70/30');
    else if (splitLayout === '70/30') setSplitLayout('30/70');
    else if (splitLayout === '30/70') setSplitLayout('canvas-only');
    else setSplitLayout('50/50');
  };

  return (
    <header className="h-14 glass-panel z-40 px-3 md:px-4 flex items-center justify-between border-b border-white/10 shrink-0 select-none">
      {/* Brand & Segmented View Controls */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <div
          onClick={() => setActiveView('landing')}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow shrink-0 cursor-pointer hover:scale-105 transition"
          title="Return to Public Overview"
        >
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div
          className="flex items-center space-x-1.5 cursor-pointer"
          onClick={() => setActiveView('landing')}
        >
          <span className="font-semibold tracking-tight text-white text-base">Synapse</span>
          <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold tracking-wider uppercase">
            {isTabletLayout ? 'Touch Pro' : 'Spatial Pro'}
          </span>
        </div>

        <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block"></div>

        {/* View Switcher Tabs */}
        <nav className="flex p-0.5 rounded-xl bg-black/35 border border-white/5 text-xs font-medium overflow-x-auto overflow-y-hidden max-w-[40vw] sm:max-w-[50vw] md:max-w-none no-scrollbar">
          <button
            onClick={() => setActiveView('dashboard')}
            title="Workspace Hub — View all your projects, files & quick tools"
            className={`px-2.5 sm:px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Workspace Hub
          </button>
          <button
            onClick={() => setActiveView('workspace')}
            title="Reading Board — Read PDFs, snip notes & organize visual cards"
            className={`px-2.5 sm:px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeView === 'workspace'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reading Board
          </button>
          <button
            onClick={() => setActiveView('library')}
            title="All Files — Manage all your uploaded PDF documents"
            className={`px-2.5 sm:px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeView === 'library'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setActiveView('matrix')}
            title="Compare Table — Compare clauses and citations side-by-side"
            className={`px-2.5 sm:px-3 py-1 rounded-lg transition whitespace-nowrap ${
              activeView === 'matrix'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Compare Table
          </button>
          {canAccessAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              title="Admin Portal — Manage enterprise security & team permissions"
              className={`hidden md:flex px-2.5 sm:px-3 py-1 rounded-lg transition items-center space-x-1 ${
                activeView === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-amber-400/70 hover:text-amber-300'
              }`}
            >
              <Shield className="w-3 h-3 mr-1" />
              <span>Admin</span>
            </button>
          )}
        </nav>
      </div>


      {/* PROFESSIONAL FIELD PRESET SELECTOR (Plain English labels) */}
      <div className="hidden lg:flex items-center space-x-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
        <button
          onClick={() => switchField('legal')}
          className={`px-2 py-1 rounded-lg transition flex items-center space-x-1 ${
            activeField === 'legal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
          title="Legal & Contracts Mode"
        >
          <Scale className="w-3 h-3 text-amber-400" />
          <span>Legal</span>
        </button>

        <button
          onClick={() => switchField('academic')}
          className={`px-2 py-1 rounded-lg transition flex items-center space-x-1 ${
            activeField === 'academic' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
          title="Study & Research Mode"
        >
          <GraduationCap className="w-3 h-3 text-blue-400" />
          <span>Research</span>
        </button>

        <button
          onClick={() => switchField('business')}
          className={`px-2 py-1 rounded-lg transition flex items-center space-x-1 ${
            activeField === 'business' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
          title="Business & Finance Mode"
        >
          <Briefcase className="w-3 h-3 text-emerald-400" />
          <span>Business</span>
        </button>

        <button
          onClick={() => switchField('medical')}
          className={`px-2 py-1 rounded-lg transition flex items-center space-x-1 ${
            activeField === 'medical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
          title="Medical & Health Mode"
        >
          <Stethoscope className="w-3 h-3 text-rose-400" />
          <span>Medical</span>
        </button>
      </div>

      {/* ACTIVE DOCUMENT BADGE (Clean, subtle center indicator) */}
      {selectedDoc && (
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-300 max-w-sm truncate">
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate font-medium">{selectedDoc.title}</span>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {selectedDoc.pages || selectedDoc.parsedPdf?.totalPages || 1}p
          </span>
        </div>
      )}

      {/* Right Header: Quick Tools Toggle & User Identity */}
      <div className="flex items-center space-x-2">
        {/* Quick Tools & Settings Trigger */}
        <button
          onClick={onOpenQuickSettings}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold transition shadow-apple-glow"
          title="Open Quick Settings & Workspace Tools (Theme, Split, Canvas Design, Font Size)"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Tools</span>
        </button>

        {/* Light / Dark Mode Quick Toggle */}
        <button
          onClick={() => updateAppSettings({ theme: appSettings.theme === 'light' ? 'dark' : 'light' })}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/10 transition"
          title={appSettings.theme === 'light' ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
        >
          {appSettings.theme === 'light' ? (
            <Moon className="w-4 h-4 text-indigo-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>

        {/* User Pill / Sign In Modal */}
        {currentUser ? (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center space-x-1.5 p-1 pl-2 pr-1 rounded-full glass-panel hover:border-white/20 transition"
              title="Enterprise Dossiers Hub"
            >
              <span className="hidden md:inline text-xs font-semibold text-slate-200">
                {currentUser.name.split(' ')[0]}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-apple-subtle">
                {currentUser.name.charAt(0)}
              </div>
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveView('auth')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-apple-glow transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

      </div>
    </header>
  );
};
