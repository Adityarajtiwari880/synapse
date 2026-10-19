import React, { useState, useRef } from 'react';
import {
  Layers,
  Scale,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Scissors,
  Upload,
  FileDown,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ChevronRight,
  Search,
  Filter,
  UserPlus,
  Lock,
  Sun,
  Moon,
  Bookmark,
  FileText,
  Building,
  Sliders,
  Maximize2,
  Tablet,
  Monitor,
  Type,
  Zap,
  HelpCircle,
  Download
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallModal } from '../common/InstallModal';
import { ProfessionalField, EnterpriseMatter, ProjectWorkflowMode } from '../../types';

export const PersonalizedDashboard: React.FC = () => {
  const {
    matters,
    activeMatter,
    selectMatter,
    createMatter,
    activeField,
    switchField,
    navigateTo,
    importDocument,
    appSettings,
    updateAppSettings,
    setSqueezeMode
  } = useWorkspace();

  const { currentUser, canAccessAdmin } = useAuth();
  const { isInstalled } = usePWAInstall();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'researcher' | 'reviewer'>('researcher');
  const [inviteSent, setInviteSent] = useState(false);

  // New Matter Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newWorkflowMode, setNewWorkflowMode] = useState<ProjectWorkflowMode>('ai_assistant');

  // Upload Notification
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  const isLight = appSettings.theme === 'light';

  const toggleTheme = () => {
    updateAppSettings({ theme: isLight ? 'dark' : 'light' });
  };

  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutFlow = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigateTo('landing');
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importDocument(file);
      setUploadToast(`Loaded "${file.name}"! Opening Reading Board...`);
      setTimeout(() => {
        setUploadToast(null);
        navigateTo('workspace');
      }, 1000);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    }, 1800);
  };

  const handleCreateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMatter({
      title: newTitle,
      client: newClient || 'Personal Research',
      field: activeField,
      workflowMode: newWorkflowMode,
      description: newDesc || 'Visual workspace with PDF documents and connected notes.',
      documentCount: 1,
      nodeCount: 2,
      collaboratorCount: 1,
      status: 'active'
    });
    updateAppSettings({ workflowMode: newWorkflowMode });
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewClient('');
    setNewDesc('');
  };

  // Plain-English Category Configuration Details
  const getCategoryMeta = () => {
    switch (activeField) {
      case 'legal':
        return {
          title: 'Legal & Contracts Hub',
          subtitle: 'Review agreements, audit indemnity clauses, and organize case evidence without paper clutter.',
          icon: Scale,
          color: 'text-amber-500',
          bgAccent: 'from-amber-500/10 to-orange-500/5',
          borderAccent: 'border-amber-500/30',
          badgeText: 'Legal & Compliance Workspace',
          quickActions: [
            { label: '✂️ Snip Contract Clause', desc: 'Freeform or 1:1, 4:3, 16:9 ratios', action: () => navigateTo('workspace') },
            { label: '⚡ Pinch Squeeze Highlights', desc: 'Fold pages to view key clauses', action: () => { setSqueezeMode('highlights'); navigateTo('workspace'); } },
            { label: '📄 Export Summary Brief', desc: 'Download clean Word / Markdown memo', action: () => navigateTo('workspace') },
          ],
          keyStats: [
            { label: 'Clauses Audited', value: '14 Clauses' },
            { label: 'Evidence Links', value: '6 Backlinks' },
          ]
        };
      case 'medical':
        return {
          title: 'Medical & Clinical Hub',
          subtitle: 'Study clinical trial protocols, review medical journals, and synthesize adverse event data safely.',
          icon: Stethoscope,
          color: 'text-emerald-500',
          bgAccent: 'from-emerald-500/10 to-teal-500/5',
          borderAccent: 'border-emerald-500/30',
          badgeText: 'Health & Clinical Workspace',
          quickActions: [
            { label: '✂️ Snip Trial Data / Charts', desc: 'Preserve figures & dosage tables', action: () => navigateTo('workspace') },
            { label: '⚡ Squeeze Protocol Pages', desc: 'Hide filler & review treatment outcomes', action: () => { setSqueezeMode('highlights'); navigateTo('workspace'); } },
            { label: '📊 Cohort Comparison Table', desc: 'Side-by-side study matrix', action: () => navigateTo('matrix') },
          ],
          keyStats: [
            { label: 'Active Protocols', value: '3 Studies' },
            { label: 'Data Privacy', value: '100% On-Device' },
          ]
        };
      case 'business':
        return {
          title: 'Business & Finance Hub',
          subtitle: 'Review company filings, financial disclosures, credit agreements, and due diligence dossiers.',
          icon: Briefcase,
          color: 'text-blue-500',
          bgAccent: 'from-blue-500/10 to-indigo-500/5',
          borderAccent: 'border-blue-500/30',
          badgeText: 'Business & Due Diligence',
          quickActions: [
            { label: '✂️ Snip Financial Tables', desc: 'Crop balance sheets & footnotes', action: () => navigateTo('workspace') },
            { label: '⚡ Squeeze Revenue Metrics', desc: 'Jump between annual reports', action: () => { setSqueezeMode('highlights'); navigateTo('workspace'); } },
            { label: '📄 Export Investment Memo', desc: 'Share concise summary with partners', action: () => navigateTo('workspace') },
          ],
          keyStats: [
            { label: 'Due Diligence Files', value: '8 Documents' },
            { label: 'Covenants Checked', value: '4 Verified' },
          ]
        };
      case 'academic':
      default:
        return {
          title: 'Study & Literature Review Hub',
          subtitle: 'Read research papers, annotate key formulas, and connect concepts in an infinite spatial mind map.',
          icon: GraduationCap,
          color: 'text-indigo-500',
          bgAccent: 'from-indigo-500/10 to-purple-500/5',
          borderAccent: 'border-indigo-500/30',
          badgeText: 'Academic & Research Workspace',
          quickActions: [
            { label: '✂️ Snip Equations & Diagrams', desc: 'Exact quotes with two-way jump links', action: () => navigateTo('workspace') },
            { label: '⚡ Pinch Squeeze Papers', desc: 'View abstract, theorems & conclusions', action: () => { setSqueezeMode('highlights'); navigateTo('workspace'); } },
            { label: '📊 Literature Compare Table', desc: 'Cross-paper comparison matrix', action: () => navigateTo('matrix') },
          ],
          keyStats: [
            { label: 'Papers Read', value: '32 Papers' },
            { label: 'Citation Links', value: '100% Verifiable' },
          ]
        };
    }
  };

  const meta = getCategoryMeta();
  const CategoryIcon = meta.icon;

  const filteredMatters = matters.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matterNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && m.field === activeField;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      isLight ? 'bg-[#f4f6f9] text-slate-900' : 'bg-[#07080f] text-slate-100'
    }`}>
      {/* Hidden File Input for Document Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.doc,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp,.gif,.svg,.json,.csv,.tsv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* TOP HEADER */}
      <header className={`px-3 sm:px-6 py-3 border-b ios-glass flex items-center justify-between sticky top-0 z-30 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}>
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Synapse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls: Theme Toggle, Upload, Workspace, PWA Install */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold shrink-0">
          {/* Download / Install App Pill Button */}
          {!isInstalled && (
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="ios-glass-btn px-2.5 sm:px-3 py-1.5 text-cyan-400 hover:text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60 flex items-center space-x-1.5 transition"
              title="Download Synapse Web App for iPad, Mac, or PC"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Day / Night Mode Switcher Button */}
          <button
            onClick={toggleTheme}
            className="ios-glass-btn px-2.5 sm:px-3 py-1.5 flex items-center space-x-1.5"
            title={isLight ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
          >
            {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>{isLight ? 'Day' : 'Night'}</span>
          </button>

          {/* Upload Any PDF / Word Doc Quick Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ios-glass-btn px-2.5 sm:px-3 py-1.5 text-blue-500 flex items-center space-x-1.5"
            title="Upload any PDF or Word document"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>

          {/* Launch Core Spatial Studio */}
          <button
            onClick={() => navigateTo('workspace')}
            className="ios-glass-btn-primary px-3.5 sm:px-4 py-1.5 flex items-center space-x-1.5 shadow-apple-glow"
          >
            <span>Reading Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Admin link only visible if user is admin */}
          {canAccessAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              className="hidden md:inline-flex ios-glass-btn px-3 py-1.5 text-amber-500"
            >
              Admin
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="ios-glass-btn px-3 py-1.5 text-red-500 hover:text-red-400"
            title="Log Out"
          >
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xl animate-in fade-in duration-200">
          <div className={`p-7 rounded-3xl border shadow-2xl max-w-sm w-full mx-4 text-center ios-glass ${
            isLight ? 'border-slate-200 text-slate-900' : 'border-white/15 text-white'
          }`}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-apple-glow">
              <Layers className="w-7 h-7 text-red-500" />
            </div>
            
            {isLoggingOut ? (
              <div className="space-y-2 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold">Logging Out...</h3>
                <p className="text-xs text-slate-400">Please wait a moment.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold mb-1">Sign Out</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Are you sure you want to sign out of your workspace?</p>
                </div>
                <div className="flex space-x-2.5">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl ios-glass-btn font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutFlow}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Toast */}
      {uploadToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{uploadToast}</span>
        </div>
      )}

      {/* MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* 1. WELCOME HERO & 3 INTUITIVE ACTION CARDS */}
        <div className="ios-glass-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Welcome back, {currentUser?.name?.split(' ')[0] || 'Researcher'} 👋
              </h1>
              <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                What would you like to read, review, or study today?
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs">
              <button
                onClick={() => switchField('legal')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 font-semibold ${
                  activeField === 'legal' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Legal</span>
              </button>
              <button
                onClick={() => switchField('academic')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 font-semibold ${
                  activeField === 'academic' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Research</span>
              </button>
              <button
                onClick={() => switchField('business')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 font-semibold ${
                  activeField === 'business' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Business</span>
              </button>
              <button
                onClick={() => switchField('medical')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 font-semibold ${
                  activeField === 'medical' ? 'bg-blue-600 text-white shadow-apple-glow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Medical</span>
              </button>
            </div>
          </div>

          {/* 3 Prominent Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Action 1: Upload Document */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="ios-glass-card p-5 cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold group-hover:text-blue-500 transition ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Upload Document
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Open PDF, Word (.docx), or text files
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-500 flex items-center space-x-1 pt-1">
                <span>Select file</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>

            {/* Action 2: Open Reading Board */}
            <div
              onClick={() => navigateTo('workspace')}
              className="ios-glass-card p-5 cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold group-hover:text-indigo-500 transition ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Open Reading Board
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    View documents and notes side-by-side
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-500 flex items-center space-x-1 pt-1">
                <span>Start reading</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>

            {/* Action 3: New Project Folder */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="ios-glass-card p-5 cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold group-hover:text-emerald-500 transition ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    New Project
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Create an organized workspace folder
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-500 flex items-center space-x-1 pt-1">
                <span>Create folder</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </div>
        </div>

        {/* 2. YOUR DOCUMENTS & PROJECTS SECTION */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search your documents or projects..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-black/40 border-white/15 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="ios-glass-btn px-3 py-2 text-xs font-semibold flex items-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                <span>Invite Teammate</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="ios-glass-btn-primary px-4 py-2 text-xs font-bold shadow-apple-glow flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* PROJECTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatters.map(matter => (
              <div
                key={matter.id}
                className="ios-glass-card p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                        <CategoryIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-blue-500">{matter.matterNumber}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {matter.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{matter.lastModified}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-base font-bold group-hover:text-blue-500 transition ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {matter.title}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-1.5">
                      <Building className="w-3 h-3" />
                      <span>{matter.client}</span>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {matter.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{matter.documentCount} docs</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{matter.nodeCount} notes</span>
                    </span>
                  </div>

                  <button
                    onClick={() => selectMatter(matter.id)}
                    className="ios-glass-btn-primary text-xs font-bold px-4 py-2 flex items-center space-x-1 shadow-apple-glow"
                  >
                    <span>Open in Board</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. QUICK DRAG-AND-DROP PDF ZONE */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed transition cursor-pointer text-center space-y-2 group ${
            isLight
              ? 'bg-blue-50/50 hover:bg-blue-50 border-blue-200 hover:border-blue-400'
              : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/15 hover:border-blue-500/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto group-hover:scale-110 transition">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              Upload Any PDF, Word Document, or Text File to Begin
            </h4>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Drag & drop your PDF, .docx agreement, research paper, or notes here, or click to browse.
            </p>
          </div>
        </div>
      </main>

      {/* TEAM COLLABORATION MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-white/15 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base">Invite Teammate / Add Admin</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Invite colleagues to read documents together, create visual notes, and organize research in real time.
            </p>

            {inviteSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Invitation link sent to {inviteEmail}!</span>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium mb-1">Teammate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com or researcher@university.edu"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Permissions</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
                    }`}
                  >
                    <option value="researcher">Editor (Can crop, annotate, ink, connect cards)</option>
                    <option value="admin">Team Admin (Can invite members, manage permissions)</option>
                    <option value="reviewer">Reviewer (Read-only comments & citations)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-apple-glow"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-white/15 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <CategoryIcon className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base">New {activeField.toUpperCase()} Project</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${activeField === 'legal' ? 'Agreement & Clause Audit' : 'Paper Review & Meta-Analysis'}`}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Organization or Client</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp or Stanford Lab"
                  value={newClient}
                  onChange={e => setNewClient(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">What is this project about?</label>
                <textarea
                  rows={3}
                  placeholder="Describe your research goals or what you want to extract..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
                  }`}
                />
              </div>

              {/* Workflow Mode Selector */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  How do you want to work?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewWorkflowMode('manual')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      newWorkflowMode === 'manual'
                        ? 'border-slate-500 bg-slate-700/20 ring-2 ring-slate-500/40'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 hover:border-slate-400'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    <div className="text-xl mb-1">✍️</div>
                    <div className={`text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>Manual Studio</div>
                    <div className={`text-[10px] leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Full control. You crop, connect, and annotate everything yourself.
                    </div>
                    {newWorkflowMode === 'manual' && (
                      <div className="mt-2 text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                        <span>Selected</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewWorkflowMode('ai_assistant')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      newWorkflowMode === 'ai_assistant'
                        ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 hover:border-purple-400'
                          : 'border-white/10 bg-white/[0.03] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="text-xl mb-1">✨</div>
                    <div className={`text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>AI Co-Pilot</div>
                    <div className={`text-[10px] leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Grounded AI reads your document and suggests insights, summaries, and citations instantly.
                    </div>
                    {newWorkflowMode === 'ai_assistant' && (
                      <div className="mt-2 text-[10px] font-semibold text-purple-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        <span>Selected</span>
                      </div>
                    )}
                  </button>
                </div>
                <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  You can switch modes anytime from Quick Settings.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-apple-glow"
                >
                  Create &amp; Open Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Download / Install Modal */}
      <InstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
    </div>
  );
};
