import React, { useState } from 'react';
import {
  Layers,
  FolderPlus,
  Search,
  Filter,
  ArrowRight,
  Shield,
  FileText,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Plus,
  Share2,
  FileDown,
  Building,
  Scale,
  Stethoscope,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { EnterpriseMatter, ProfessionalField } from '../../types';

export const EnterpriseDashboard: React.FC = () => {
  const {
    matters,
    activeMatter,
    selectMatter,
    createMatter,
    navigateTo,
    switchField
  } = useWorkspace();
  const { currentUser, canAccessAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState<'all' | ProfessionalField>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Matter Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newField, setNewField] = useState<ProfessionalField>('legal');
  const [newDesc, setNewDesc] = useState('');

  const filteredMatters = matters.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matterNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = fieldFilter === 'all' || m.field === fieldFilter;
    return matchesSearch && matchesField;
  });

  const handleCreateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMatter({
      title: newTitle,
      client: newClient || 'Internal Corporate Client',
      field: newField,
      description: newDesc || 'Spatial research dossier.',
      documentCount: 2,
      nodeCount: 4,
      collaboratorCount: 1,
      status: 'active'
    });
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewClient('');
    setNewDesc('');
  };

  const getFieldIcon = (field: ProfessionalField) => {
    switch (field) {
      case 'legal':
        return <Scale className="w-3.5 h-3.5 text-amber-400" />;
      case 'medical':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />;
      case 'business':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case 'academic':
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* TOP COMMAND BAR */}
      <header className="px-6 py-4 border-b border-white/10 bg-[#0c0d16]/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight">Synapse Enterprise Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-semibold">
                Dossiers
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Active Organization: <span className="text-white font-medium">Apex Global & Partners</span>
            </div>
          </div>
        </div>

        {/* Global Nav Links */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => navigateTo('workspace')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-apple-glow transition flex items-center space-x-1.5"
          >
            <span>Open Spatial Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateTo('matrix')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
          >
            Synthesis Matrix
          </button>
          <button
            onClick={() => navigateTo('trust')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition flex items-center space-x-1"
          >
            <Shield className="w-3 h-3 text-emerald-400 mr-1" />
            <span>Trust Center</span>
          </button>
          {canAccessAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition flex items-center space-x-1"
            >
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome & Stats Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Dossiers</div>
            <div className="text-2xl font-bold text-white mt-1">{matters.length} Matters</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>All encrypted with client keys</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spatial Nodes Mapped</div>
            <div className="text-2xl font-bold text-cyan-300 mt-1">123 Nodes</div>
            <div className="text-[11px] text-slate-400 mt-1">Across 23 multi-page agreements</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage & Enclave</div>
            <div className="text-2xl font-bold text-white mt-1">18.4 MB / 1 GB</div>
            <div className="text-[11px] text-slate-400 mt-1">Zero Cloud Retention · Local Wasm</div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Enterprise User</div>
              <div className="text-base font-bold text-white mt-1">{currentUser?.name || 'Managing Director'}</div>
              <div className="text-[10px] text-slate-300">{currentUser?.email}</div>
            </div>
            <div className="mt-2 text-[10px] text-blue-300 font-mono">ROLE: {currentUser?.role.toUpperCase()}</div>
          </div>
        </div>

        {/* CONTROLS ROW: SEARCH, FILTER, NEW BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search matter, client, or number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Field Filter */}
            <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
              <button
                onClick={() => setFieldFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  fieldFilter === 'all' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFieldFilter('legal')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  fieldFilter === 'legal' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Legal
              </button>
              <button
                onClick={() => setFieldFilter('medical')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  fieldFilter === 'medical' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Medical
              </button>
              <button
                onClick={() => setFieldFilter('business')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  fieldFilter === 'business' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Finance
              </button>
              <button
                onClick={() => setFieldFilter('academic')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  fieldFilter === 'academic' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Research
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold shadow-apple-glow transition flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Dossier</span>
          </button>
        </div>

        {/* MATTERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatters.map(matter => {
            const isCurrent = activeMatter?.id === matter.id;
            return (
              <div
                key={matter.id}
                className={`p-6 rounded-2xl bg-white/[0.03] border transition flex flex-col justify-between group hover:border-white/30 hover:bg-white/[0.05] ${
                  isCurrent ? 'border-blue-500/50 bg-blue-500/[0.03]' : 'border-white/10'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-black/40 border border-white/10">
                        {getFieldIcon(matter.field)}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400">{matter.matterNumber}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {matter.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{matter.lastModified}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                      {matter.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center space-x-1.5">
                      <Building className="w-3 h-3 text-slate-500" />
                      <span>{matter.client}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {matter.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matter.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Metrics & Action Button */}
                <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{matter.documentCount} docs</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{matter.nodeCount} nodes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{matter.collaboratorCount} peers</span>
                    </span>
                  </div>

                  <button
                    onClick={() => selectMatter(matter.id)}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-apple-glow transition flex items-center space-x-1"
                  >
                    <span>Launch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* CREATE NEW MATTER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0e101a] border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Create Spatial Research Dossier</h3>
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Dossier / Matter Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-Border Technology Acquisition Due Diligence"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Client or Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Corp"
                    value={newClient}
                    onChange={e => setNewClient(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Industry Preset</label>
                  <select
                    value={newField}
                    onChange={e => setNewField(e.target.value as ProfessionalField)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="legal">Legal & Litigation</option>
                    <option value="medical">Life Sciences & Medical</option>
                    <option value="business">Private Equity & Finance</option>
                    <option value="academic">Academic & Science</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dossier Objectives & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Describe the research questions, key agreements, or hypothesis..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-apple-glow"
                >
                  Create & Launch Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
