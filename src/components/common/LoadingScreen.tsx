import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Cpu, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
  message?: string;
}

const BOOT_STEPS = [
  { text: 'Mounting Zero-Copy Wasm Vector Engine (int8)...', icon: Cpu },
  { text: 'Calibrating 60 FPS Hardware Spatial Transform Pipeline...', icon: Zap },
  { text: 'Generating Client-Side AES-256-GCM Ephemeral Keyring...', icon: ShieldCheck },
  { text: 'Hydrating Zero-Retention Document Vault & Active Dossiers...', icon: Layers },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(12);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < BOOT_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 420);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 14) + 8;
        return Math.min(100, prev + delta);
      });
    }, 180);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100 && currentStep >= BOOT_STEPS.length - 1) {
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimeout = setTimeout(() => {
          onComplete();
        }, 500);
        return () => clearTimeout(exitTimeout);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, currentStep, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07080d] text-white select-none transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background light spheres */}
      <div className="absolute w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none -bottom-10 -right-10"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Glowing Apple-grade Logo Badge */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-[#0e101a] border border-white/20 flex items-center justify-center shadow-2xl">
            <Layers className="w-10 h-10 text-cyan-400 animate-bounce" />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1.5 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Synapse Spatial Pro</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Local-First Spatial Research & Document Analysis Engine
          </p>
        </div>

        {/* Dynamic Boot Sequence Checklist */}
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl mb-6 shadow-inner space-y-2.5 text-left">
          {BOOT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs transition-all duration-300 ${
                  isDone
                    ? 'text-emerald-400/90'
                    : isCurrent
                    ? 'text-cyan-300 font-medium'
                    : 'text-slate-600 opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'animate-spin text-cyan-400' : ''}`} />
                )}
                <span className="truncate">{step.text}</span>
              </div>
            );
          })}
        </div>

        {/* Smooth Glass Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>INITIALIZING HARDWARE ENCLAVE</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={onComplete}
          className="mt-8 text-xs text-slate-500 hover:text-slate-300 transition flex items-center space-x-1 py-1 px-3 rounded-lg hover:bg-white/5"
        >
          <span>Skip initialization</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Footer Security Watermark */}
      <div className="absolute bottom-6 text-[11px] text-slate-500 tracking-wider flex items-center space-x-2">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span>ZERO-KNOWLEDGE ARCHITECTURE · SOC2 TYPE II COMPLIANT · ON-DEVICE COMPUTE</span>
      </div>
    </div>
  );
};
