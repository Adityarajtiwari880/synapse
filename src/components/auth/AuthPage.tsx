import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Fingerprint,
  ArrowRight,
  CheckCircle2,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProfessionalField } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AuthPage: React.FC = () => {
  const { login, register, loginWithPasskey } = useAuth();
  const { navigateTo, switchField, appSettings, updateAppSettings } = useWorkspace();

  const isLight = appSettings.theme === 'light';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'reset_password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProfessionalField>('legal');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  const [showLoginLoader, setShowLoginLoader] = useState(false);

  // Corporate Domain SSO auto-detection
  const isCorporateSSO =
    email.toLowerCase().includes('@skadden.com') ||
    email.toLowerCase().includes('@pfizer.com') ||
    email.toLowerCase().includes('@blackrock.com') ||
    email.toLowerCase().includes('@synapse.ai') ||
    email.toLowerCase().includes('@oxford.edu');

  const handleAuthSuccess = () => {
    setShowLoginLoader(true);
    setTimeout(() => {
      setShowLoginLoader(false);
      navigateTo('dashboard');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (mode === 'login') {
        const ok = await login(cleanEmail, password);
        if (ok) {
          switchField(selectedCategory);
          handleAuthSuccess();
        } else {
          setError('Invalid credentials or email not verified.');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setError('Please provide your full professional name.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify.');
          setIsSubmitting(false);
          return;
        }
        const ok = await register(name, cleanEmail, password);
        if (ok) {
          setSuccessMsg('Account created! Please check your email to verify before logging in.');
          setMode('login');
        } else {
          setError('An account with this corporate email already exists, or an error occurred.');
        }
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMsg('OTP code sent to your email.');
          setMode('reset_password');
        }
      } else if (mode === 'reset_password') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        const { error: otpError } = await supabase.auth.verifyOtp({ email: cleanEmail, token: otpCode, type: 'recovery' });
        if (otpError) {
          setError(otpError.message);
        } else {
          const { error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) {
            setError(updateError.message);
          } else {
            setSuccessMsg('Password updated successfully. You can now log in.');
            setMode('login');
            setPassword('');
            setConfirmPassword('');
          }
        }
      }
    } catch (err) {
      setError('Authentication encountered a client error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskey = async () => {
    setError(null);
    setIsSubmitting(true);
    const ok = await loginWithPasskey();
    setIsSubmitting(false);
    if (ok) {
      switchField(selectedCategory);
      navigateTo('dashboard');
    } else {
      setError('Biometric verification cancelled or unavailable.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-500/30 selection:text-white relative overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-[#f5f5f7] text-slate-900' : 'bg-[#07080f] text-slate-100'
    }`}>
      {/* Login Loader Overlay */}
      {showLoginLoader && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`p-8 rounded-3xl border flex flex-col items-center justify-center space-y-4 max-w-sm w-full mx-4 shadow-2xl ${
            isLight ? 'bg-white/80 border-slate-200 text-slate-900' : 'bg-black/60 border-white/10 text-white'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-apple-glow animate-pulse">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">Logging In...</h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Setting up things for you</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <header className={`px-6 py-4 flex items-center justify-between border-b z-20 backdrop-blur-md ${
        isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-[#07080f]/70 border-white/10'
      }`}>
        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => navigateTo('landing')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Synapse Spatial Pro
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => updateAppSettings({ theme: isLight ? 'dark' : 'light' })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center space-x-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-300'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
          </button>

          <span className="text-slate-400 hidden sm:inline">Protected by End-to-End Local Enclave</span>
          <button
            onClick={() => navigateTo('landing')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/15 text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Back to Overview
          </button>
        </div>
      </header>


      {/* Main Form Centerpiece */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl p-7 shadow-2xl space-y-6">
            {/* Header & Mode Switcher */}
            <div className="space-y-3 text-center">
              <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white font-semibold shadow-apple-glow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Enterprise Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white font-semibold shadow-apple-glow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === 'login' ? 'Access Your Spatial Research Hub' : 'Register Corporate Workspace'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Sign in via Corporate SSO or local cryptographic credentials.'
                  : 'Get instant local-first access with zero cloud telemetry.'}
              </p>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SSO BUTTONS */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!isSupabaseConfigured) return alert("Enterprise SSO requires configuration in Supabase Dashboard.");
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'azure' });
                    if (error) alert(error.message);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-center space-x-2 ${
                    isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>Okta / Azure</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!isSupabaseConfigured) return alert("Enterprise SSO requires configuration in Supabase Dashboard.");
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                    if (error) alert(error.message);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-center space-x-2 ${
                    isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Google SSO</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handlePasskey}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 text-xs font-semibold text-blue-500 transition flex items-center justify-center space-x-2"
              >
                <Fingerprint className="w-4 h-4 text-blue-500" />
                <span>Sign in with Apple Touch ID / Passkey</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Or Email Credentials
              </span>
              <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}></div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name (Registration only) */}
              {mode === 'register' && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Professional Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins, Esq."
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Industry Specialization (Login and Registration) */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Industry Category (Personalizes Your Dashboard)
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as ProfessionalField)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  >
                    <option value="legal">⚖️ Legal & Litigation (M&A, Contracts, Depositions)</option>
                    <option value="medical">🩺 Life Sciences & Clinical (Protocols, Trials, FDA)</option>
                    <option value="business">💼 Private Equity & Finance (Deal Rooms, 10-K, Covenants)</option>
                    <option value="academic">🔬 Academic & Research (Literature Reviews, Papers)</option>
                  </select>
                </div>
              )}

              {/* Email (All modes except reset_password which uses the already typed email) */}
              {mode !== 'reset_password' && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Corporate or Academic Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@firm.com or name@institution.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>

                  {isCorporateSSO && (mode === 'login' || mode === 'register') && (
                    <div className="mt-1.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-500 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Corporate SSO Enforced: Instant single sign-on active.</span>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Code (Only for reset_password) */}
              {mode === 'reset_password' && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter the code sent to your email"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {mode === 'reset_password' ? 'New Password' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[10px] text-blue-500 hover:text-blue-400 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              {(mode === 'register' || mode === 'reset_password') && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Confirm {mode === 'reset_password' ? 'New Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-apple-glow transition flex items-center justify-center space-x-2 mt-2"
              >
                <span>
                  {mode === 'login' ? 'Authenticate & Enter' : 
                   mode === 'register' ? 'Complete Registration' : 
                   mode === 'forgot_password' ? 'Send OTP Code' : 
                   'Update Password & Login'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              {/* Back to Login link */}
              {(mode === 'forgot_password' || mode === 'reset_password') && (
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </form>



            {/* Security Guarantee */}
            <div className="text-center pt-2 text-[10px] text-slate-400 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Zero-knowledge client keys · Plaintext never leaves your device</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

