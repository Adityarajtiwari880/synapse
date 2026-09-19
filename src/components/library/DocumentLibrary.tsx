import React, { useState } from 'react';
import {
  Upload,
  Search,
  Filter,
  FileText,
  Clock,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const DocumentLibrary: React.FC = () => {
  const { documents, selectDocument, importDocument, setActiveView } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.authors.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      importDocument(e.target.files[0]);
    }
  };

  const handleOpenDoc = (id: string) => {
    selectDocument(id);
    setActiveView('workspace');
  };

  return (
    <div className="h-full w-full p-6 md:p-10 overflow-y-auto z-20">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Research Library</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {documents.length} Papers
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Locally stored in Origin Private File System (OPFS) and vectorized via PGlite.
            </p>
          </div>

          {/* Import Button */}
          <label className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-apple-glow cursor-pointer transition flex items-center justify-center space-x-2 shrink-0">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp,.gif,.svg,.json,.csv,.tsv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 glass-panel rounded-xl px-3.5 py-2.5 flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search across full text, embeddings, authors, and claims..."
              className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-slate-500"
            />
          </div>

          <button className="glass-panel px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white flex items-center space-x-2 transition shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Tags & Facets</span>
          </button>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => handleOpenDoc(doc.id)}
              className="glass-card rounded-2xl p-5 space-y-3 cursor-pointer group hover:border-blue-500/40 transition"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Indexed in OPFS
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{doc.pages} pages</span>
              </div>

              <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-blue-300 transition line-clamp-2">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2">
                {doc.authors} ({doc.year})
              </p>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                    {doc.highlightsCount} Highlights
                  </span>
                  <span>{doc.fileSize}</span>
                </div>

                <span className="text-blue-400 group-hover:translate-x-0.5 transition flex items-center">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
