import React from 'react';
import {
  Download,
  Share2,
  PlusSquare,
  Sparkles,
  X,
  CheckCircle2,
  Tablet,
  Laptop,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useWorkspace } from '../../context/WorkspaceContext';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { appSettings } = useWorkspace();
  const { isInstalled, isIOS, isIPad, hasNativePrompt, triggerInstall } = usePWAInstall();
  const isLight = appSettings.theme === 'light';

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await triggerInstall();
    if (res === 'prompted' || res === 'installed') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl transition border ${
          isLight
            ? 'bg-white/95 text-slate-900 border-slate-200'
            : 'bg-[#0f111a]/95 text-white border-white/15'
        } backdrop-blur-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow shrink-0">
            <Download className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold tracking-tight">
                Download Synapse
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PWA Web App
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Install as a native full-screen app on your iPad, Mac, or PC.
            </p>
          </div>
        </div>

        {/* When Already Installed */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-3 mb-6">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-sm block">Synapse is already installed!</span>
              You are running the official standalone web app.
            </div>
          </div>
        ) : hasNativePrompt ? (
          /* Chrome / Edge / Android 1-Click Install */
          <div className="space-y-4 mb-6">
            <div className={`p-4 rounded-2xl text-xs space-y-2 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center space-x-2 font-semibold text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>Instant Installation Ready</span>
              </div>
              <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                Click the button below to download and install Synapse onto your device dock or home screen. It takes less than 1 second and uses zero disk space.
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-apple-glow transition active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Install Synapse Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* iPadOS / iOS / Safari Step-by-Step Instructions */
          <div className="space-y-4 mb-6">
            <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 border ${
              isLight ? 'bg-blue-50/80 border-blue-200 text-blue-900' : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
            }`}>
              <Tablet className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="font-medium">
                {isIPad || isIOS ? 'Apple iPad & iPhone Instructions' : 'Browser Download Instructions'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <span className="font-semibold block text-sm">
                    Tap the Share button
                  </span>
                  <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                    In Safari's top toolbar (on iPad) or bottom bar (on iPhone), tap the <strong>Share</strong> icon{' '}
                    <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />.
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <span className="font-semibold block text-sm">
                    Select "Add to Home Screen"
                  </span>
                  <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                    Scroll down the share sheet and tap{' '}
                    <strong className="text-blue-400">Add to Home Screen</strong>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />.
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <span className="font-semibold block text-sm">
                    Tap "Add" in Top Right
                  </span>
                  <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                    Confirm by tapping <strong>Add</strong>. Synapse will now appear as an app icon on your iPad Home Screen!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
          <div className="p-2">
            <span className="text-base block">📱</span>
            <span className="text-[11px] font-semibold block mt-0.5">Full Screen</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No browser bars</span>
          </div>
          <div className="p-2">
            <span className="text-base block">⚡</span>
            <span className="text-[11px] font-semibold block mt-0.5">Ultra Fast</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cached app shell</span>
          </div>
          <div className="p-2">
            <span className="text-base block">🔒</span>
            <span className="text-[11px] font-semibold block mt-0.5">Safe &amp; Private</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Local processing</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className={`text-xs font-semibold hover:underline ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
