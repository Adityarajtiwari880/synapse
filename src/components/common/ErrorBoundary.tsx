import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Synapse ErrorBoundary]', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#0c0d14] text-slate-100 p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Workspace Recovery Mode
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synapse encountered an unexpected rendering error. Your local work is safe. You can reload or reset the workspace cache below.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 font-semibold text-xs border border-white/10 transition flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
