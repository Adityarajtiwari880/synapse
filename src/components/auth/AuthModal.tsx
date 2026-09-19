import React, { useState } from 'react';
import { X, Fingerprint, ScanFace, Mail, Lock, User as UserIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithPasskey } = useAuth();
  const { addAuditLog } = useWorkspace();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        addAuditLog('login', `Logged in via email/password: ${email}`);
        onClose();
      }
    } else {
      const ok = await register(name, email, password);
      if (ok) {
        addAuditLog('login', `Registered new user account: ${name} (${email})`);
        onClose();
      }
    }
    setIsLoading(false);
  };

  const handlePasskey = async () => {
    setIsLoading(true);
    setPasskeySuccess(false);
    const ok = await loginWithPasskey();
    if (ok) {
      setPasskeySuccess(true);
      addAuditLog('passkey_auth', 'Authenticated via Apple Touch ID / Face ID WebAuthn Passkey');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-7 border border-white/15 shadow-2xl relative select-none animate-in fade-in zoom-in-95 duration-200">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Biometric Brand Icon */}
        <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-apple-glow">
          <Fingerprint className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-xl font-bold text-center text-white tracking-tight">
          {mode === 'login' ? 'Sign In to Synapse' : 'Create Synapse Vault'}
        </h2>
        <p className="text-xs text-center text-slate-400 mt-1 mb-5">
          Zero-budget local-first research platform with cryptographic privacy.
        </p>

        {/* Apple Segmented Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-black/40 border border-white/5 mb-5 text-xs font-medium">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              mode === 'login' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              mode === 'register' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Aditya Raj Tiwari"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="aditya@synapse.ai"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-apple-glow transition flex items-center justify-center space-x-2"
          >
            <span>{mode === 'login' ? 'Continue with Password' : 'Create Encrypted Vault'}</span>
          </button>
        </form>

        {/* WebAuthn / Apple Touch ID & Face ID Integration */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handlePasskey}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center justify-center space-x-2 transition shadow-sm"
          >
            {passkeySuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Touch ID Verified!</span>
              </>
            ) : (
              <>
                <ScanFace className="w-4 h-4 text-blue-400" />
                <span>Sign In with Touch ID / Face ID</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
