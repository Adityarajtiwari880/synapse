import React from 'react';
import {
  Sliders,
  X,
  Tablet,
  Monitor,
  Sparkles,
  Type,
  Sun,
  Moon,
  Coffee,
  Check,
  Zap
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DeviceMode, AppTheme, AITone, TypographyFamily, DensityMode } from '../../types';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSettingsPopover: React.FC<QuickSettingsProps> = ({ isOpen, onClose }) => {
  const { appSettings, updateAppSettings } = useWorkspace();

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 w-84 sm:w-96 glass-panel rounded-3xl p-5 border border-white/15 shadow-2xl z-50 select-none animate-in fade-in zoom-in-95 duration-150 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Quick Customizer</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. DEVICE LAYOUT OVERRIDE */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
          <span>Device Ergonomic Layout</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 text-[11px] font-medium">
          <button
            onClick={() => updateAppSettings({ deviceMode: 'auto' })}
            className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
              appSettings.deviceMode === 'auto' ? 'bg-white/15 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Auto</span>
          </button>
          <button
            onClick={() => updateAppSettings({ deviceMode: 'tablet' })}
            className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
              appSettings.deviceMode === 'tablet' ? 'bg-indigo-600 text-white shadow-ghost-glow font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3 h-3" />
            <span>iPad / Tab</span>
          </button>
          <button
            onClick={() => updateAppSettings({ deviceMode: 'desktop' })}
            className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
              appSettings.deviceMode === 'desktop' ? 'bg-blue-600 text-white shadow-apple-glow font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Mac / Win</span>
          </button>
        </div>
      </div>

      {/* 2. COLOR THEME */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Reading Aesthetic
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => updateAppSettings({ theme: 'dark' })}
            className={`p-2 rounded-xl border transition flex items-center space-x-2 text-left ${
              appSettings.theme === 'dark'
                ? 'bg-blue-600/20 border-blue-500/50 text-white'
                : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-blue-400" />
            <div>
              <div className="font-semibold text-white text-[11px]">Dark Obsidian</div>
              <div className="text-[9px] text-slate-400">Default Apple Glass</div>
            </div>
          </button>

          <button
            onClick={() => updateAppSettings({ theme: 'sepia' })}
            className={`p-2 rounded-xl border transition flex items-center space-x-2 text-left ${
              appSettings.theme === 'sepia'
                ? 'bg-amber-600/20 border-amber-500/50 text-white'
                : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-amber-200 text-[11px]">Warm Sepia</div>
              <div className="text-[9px] text-slate-400">Eye-strain reduction</div>
            </div>
          </button>

          <button
            onClick={() => updateAppSettings({ theme: 'midnight' })}
            className={`p-2 rounded-xl border transition flex items-center space-x-2 text-left ${
              appSettings.theme === 'midnight'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/40" />
            <div>
              <div className="font-semibold text-white text-[11px]">Midnight OLED</div>
              <div className="text-[9px] text-slate-400">Pure pitch black</div>
            </div>
          </button>

          <button
            onClick={() => updateAppSettings({ theme: 'light' })}
            className={`p-2 rounded-xl border transition flex items-center space-x-2 text-left ${
              appSettings.theme === 'light'
                ? 'bg-white/20 border-white/50 text-white'
                : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-300" />
            <div>
              <div className="font-semibold text-white text-[11px]">Crisp Light</div>
              <div className="text-[9px] text-slate-400">Daytime clarity</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. AI EXPLANATION TONE (BEGINNER VS ACADEMIC) */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>AI Explanation Complexity</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 text-[11px]">
          <button
            onClick={() => updateAppSettings({ aiTone: 'beginner' })}
            className={`py-1.5 rounded-lg transition ${
              appSettings.aiTone === 'beginner' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="Plain English with analogies (ELI5)"
          >
            👶 Plain English
          </button>
          <button
            onClick={() => updateAppSettings({ aiTone: 'academic' })}
            className={`py-1.5 rounded-lg transition ${
              appSettings.aiTone === 'academic' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="Deep mathematical and scientific rigor"
          >
            🔬 Academic
          </button>
          <button
            onClick={() => updateAppSettings({ aiTone: 'concise' })}
            className={`py-1.5 rounded-lg transition ${
              appSettings.aiTone === 'concise' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="High-yield 3-bullet summary"
          >
            ⚡ Concise
          </button>
        </div>
      </div>

      {/* 4. TYPOGRAPHY */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
          <Type className="w-3 h-3 text-cyan-400" />
          <span>Reading Typography</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 text-[11px]">
          <button
            onClick={() => updateAppSettings({ fontFamily: 'sans' })}
            className={`py-1 rounded-lg transition ${
              appSettings.fontFamily === 'sans' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            SF Pro Sans
          </button>
          <button
            onClick={() => updateAppSettings({ fontFamily: 'serif' })}
            className={`py-1 rounded-lg transition font-serif ${
              appSettings.fontFamily === 'serif' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Academic Serif
          </button>
          <button
            onClick={() => updateAppSettings({ fontFamily: 'dyslexic' })}
            className={`py-1 rounded-lg transition ${
              appSettings.fontFamily === 'dyslexic' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dyslexia Font
          </button>
        </div>
      </div>

      {/* 5. DENSITY / TEXT SPACING */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Reading Density & Scale
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 text-[11px]">
          <button
            onClick={() => updateAppSettings({ density: 'comfortable' })}
            className={`py-1.5 rounded-lg transition font-semibold ${
              appSettings.density === 'comfortable' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Comfortable (Spacious)
          </button>
          <button
            onClick={() => updateAppSettings({ density: 'compact' })}
            className={`py-1.5 rounded-lg transition font-semibold ${
              appSettings.density === 'compact' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compact (High Yield)
          </button>
        </div>
      </div>

      {/* 6. GESTURE & PALM REJECTION TOGGLES */}
      <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-slate-300">Apple Pencil Palm Rejection</span>
          <input
            type="checkbox"
            checked={appSettings.enablePalmRejection}
            onChange={e => updateAppSettings({ enablePalmRejection: e.target.checked })}
            className="accent-blue-600 w-4 h-4 rounded"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-slate-300">Show Onboarding Gesture Hints</span>
          <input
            type="checkbox"
            checked={appSettings.showGestureHints}
            onChange={e => updateAppSettings({ showGestureHints: e.target.checked })}
            className="accent-blue-600 w-4 h-4 rounded"
          />
        </label>
      </div>
    </div>
  );
};
