import React, { useState, useEffect } from 'react';
import {
  Search,
  Bot,
  Columns,
  Layers,
  Table,
  Shield,
  Activity,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleDebugger: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onToggleDebugger
}) => {
  const {
    setActiveView,
    splitLayout,
    setSplitLayout,
    runAgentSynthesis,
    toggleGhostLayer
  } = useWorkspace();

  const { canAccessAdmin } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'synth',
      label: 'Run Multi-Document Synthesis Agent',
      shortcut: 'Shift + A',
      icon: <Bot className="w-4 h-4 text-blue-400" />,
      run: () => {
        runAgentSynthesis();
        setActiveView('matrix');
      }
    },
    {
      id: 'split',
      label: `Toggle Split Layout (Current: ${splitLayout})`,
      shortcut: '\\',
      icon: <Columns className="w-4 h-4 text-slate-400" />,
      run: () => {
        setSplitLayout(splitLayout === '50/50' ? 'canvas-only' : '50/50');
      }
    },
    {
      id: 'ghost',
      label: 'Toggle Ephemeral AI Ghost Suggestions',
      shortcut: 'G',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      run: () => toggleGhostLayer()
    },
    {
      id: 'debug',
      label: 'Open System Diagnostics & 60fps Debugger',
      shortcut: '⌘D',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      run: () => onToggleDebugger()
    },
    {
      id: 'nav-lib',
      label: 'Navigate to Document Library',
      shortcut: 'L',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      run: () => setActiveView('library')
    },
    {
      id: 'nav-matrix',
      label: 'Navigate to Synthesis Matrix',
      shortcut: 'M',
      icon: <Table className="w-4 h-4 text-cyan-400" />,
      run: () => setActiveView('matrix')
    }
  ];

  if (canAccessAdmin) {
    actions.push({
      id: 'nav-admin',
      label: 'Open Enterprise Admin & Governance Portal',
      shortcut: 'P',
      icon: <Shield className="w-4 h-4 text-amber-400" />,
      run: () => setActiveView('admin')
    });
  }

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl glass-panel rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
      >
        <div className="p-3.5 border-b border-white/10 flex items-center space-x-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search claims..."
            className="bg-transparent border-none outline-none text-xs sm:text-sm text-white w-full placeholder-slate-500"
          />
          <kbd className="text-[10px] text-slate-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.map(action => (
            <div
              key={action.id}
              onClick={() => {
                action.run();
                onClose();
              }}
              className="p-2.5 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs text-slate-200 transition"
            >
              <div className="flex items-center space-x-2.5">
                {action.icon}
                <span>{action.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
                {action.shortcut}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
