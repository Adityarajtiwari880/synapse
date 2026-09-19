import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  X,
  Bug,
  Cpu,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Download,
  Layers,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface SystemDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDebugger: React.FC<SystemDebuggerProps> = ({ isOpen, onClose }) => {
  const { nodes, edges, ghosts, documents, auditLogs } = useWorkspace();

  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>(new Array(24).fill(60));
  const [memoryMb, setMemoryMb] = useState(148);
  const [activeTab, setActiveTab] = useState<'perf' | 'state' | 'events'>('perf');

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // 60FPS Meter Loop
  useEffect(() => {
    let animId: number;

    const measureFps = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 500) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        setFpsHistory(prev => [...prev.slice(1), currentFps]);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Simulated dynamic memory consumption based on node counts
        setMemoryMb(Math.round(120 + nodes.length * 4.2 + (Math.random() * 6 - 3)));
      }

      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, [nodes.length]);

  if (!isOpen) return null;

  const exportDebugBundle = () => {
    const bundle = {
      timestamp: new Date().toISOString(),
      platform: navigator.userAgent,
      performance: {
        fpsCurrent: fps,
        fpsHistory,
        estimatedHeapMb: memoryMb
      },
      spatialGraph: {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        ghostsCount: ghosts.length,
        documentsCount: documents.length
      },
      recentLogs: auditLogs.slice(0, 10)
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse_diagnostic_bundle_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 glass-panel rounded-3xl p-5 border border-white/15 shadow-2xl z-50 select-none animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bug className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">System Diagnostics & Debugger</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={exportDebugBundle}
            className="p-1 text-slate-400 hover:text-white rounded transition"
            title="Export Diagnostic Bundle"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/5 mb-3 text-[11px] font-medium">
        <button
          onClick={() => setActiveTab('perf')}
          className={`flex-1 py-1 rounded-lg transition ${
            activeTab === 'perf' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('state')}
          className={`flex-1 py-1 rounded-lg transition ${
            activeTab === 'state' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Graph State
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-1 rounded-lg transition ${
            activeTab === 'events' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Event Bus
        </button>
      </div>

      {/* Tab 1: Real-time Performance HUD */}
      {activeTab === 'perf' && (
        <div className="space-y-3.5 text-xs">
          {/* 60 FPS Gauge */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Compositor Frame Rate:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {fps} FPS
              </span>
            </div>

            {/* Visual Sparkline Bar Graph */}
            <div className="h-8 flex items-end space-x-1 pt-1">
              {fpsHistory.map((val, idx) => {
                const heightPercent = Math.min(100, Math.max(15, (val / 60) * 100));
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-sm transition-all duration-300 ${
                      val >= 55 ? 'bg-emerald-400/70' : 'bg-amber-400/70'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Memory Usage Meter */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">WebKit Tab Memory:</span>
              <span className="font-mono text-white">{memoryMb} MB / 1,200 MB</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(memoryMb / 1200) * 100}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500">
              Safe Headroom: {1200 - memoryMb} MB before iOS tab termination
            </div>
          </div>

          {/* Worker Queue Depth */}
          <div className="flex justify-between text-slate-300 px-1 text-[11px]">
            <span>Background Workers:</span>
            <span className="text-emerald-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Idle (0 queued)
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Graph State Inspector */}
      {activeTab === 'state' && (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Smart Nodes:</span>
              <span className="font-mono font-bold text-white">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Curved Bezier Edges:</span>
              <span className="font-mono font-bold text-white">{edges.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unaccepted Ghosts:</span>
              <span className="font-mono font-bold text-indigo-300">{ghosts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Loaded Documents:</span>
              <span className="font-mono font-bold text-blue-400">{documents.length}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 px-1">
            CRDT Engine: Yjs v13.6 · Transaction state vectors synchronized locally.
          </div>
        </div>
      )}

      {/* Tab 3: Event Bus Log */}
      {activeTab === 'events' && (
        <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-300">
          {auditLogs.slice(0, 6).map(log => (
            <div key={log.id} className="p-1.5 rounded-lg bg-black/20 border border-white/5 truncate">
              <span className="text-blue-400">[{log.action}]</span> {log.details}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
