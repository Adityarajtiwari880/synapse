import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  Sparkles,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProfessionalField } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AuthPage: React.FC = () => {
  const { login, register, loginWithPasskey, loginAsGuest } = useAuth();
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

  const handleAuthSuccess = () => {
    setShowLoginLoader(true);
    setTimeout(() => {
      setShowLoginLoader(false);
      navigateTo('dashboard');
    }, 1500);
  };

  const handleGuestLogin = () => {
    setIsSubmitting(true);
    setError(null);
    loginAsGuest();
    switchField(selectedCategory);
    handleAuthSuccess();
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[140px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-indigo-500/15 blur-[130px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <header className={`px-6 py-4 flex items-center justify-between border-b z-20 ios-glass ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}>
        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => navigateTo('landing')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Synapse
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
            Sign In
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => updateAppSettings({ theme: isLight ? 'dark' : 'light' })}
            className="ios-glass-btn px-3 py-1.5 flex items-center space-x-1.5 font-semibold text-xs"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLight ? 'Dark' : 'Light'}</span>
          </button>

          {/* Glossy Back Button */}
          <button
            onClick={() => navigateTo('landing')}
            className="ios-glass-btn px-3.5 py-1.5 flex items-center space-x-1.5 font-semibold text-xs"
            title="Return to Home Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Form Centerpiece */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-md">
          {/* iOS Liquid Glass Card */}
          <div className="ios-glass-card p-7 sm:p-8 space-y-6">
            {/* Mode Switcher Segmented Control */}
            <div className="space-y-3 text-center">
              <div className="inline-flex p-1 rounded-2xl bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-5 py-2 rounded-xl transition ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-apple-glow'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-5 py-2 rounded-xl transition ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-apple-glow'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {mode === 'login'
                  ? 'Sign in to access your documents and reading notes.'
                  : 'Start reading, highlighting, and connecting your documents.'}
              </p>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ONE-CLICK INSTANT TEST / GUEST ACCESS BUTTON */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl ios-glass-btn flex items-center justify-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm"
                title="Immediately test all features without needing to create an account"
              >
                <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span>Instant Test Access (1-Click Guest)</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!isSupabaseConfigured) return alert("Google Sign-In requires Supabase configuration.");
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                    if (error) alert(error.message);
                  }}
                  className="ios-glass-btn py-2 px-3 text-xs font-medium flex items-center justify-center space-x-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={handlePasskey}
                  className="ios-glass-btn py-2 px-3 text-xs font-medium flex items-center justify-center space-x-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Apple ID</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Or With Email
              </span>
              <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}></div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name (Registration only) */}
              {mode === 'register' && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Taylor"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/40 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Industry Specialization */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Your Field or Goal
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as ProfessionalField)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
                    }`}
                  >
                    <option value="legal">⚖️ Legal & Contracts (Agreements, Clauses)</option>
                    <option value="academic">🔬 Research & Studies (Papers, Books, Literature)</option>
                    <option value="business">💼 Business & Finance (Reports, Proposals, Decks)</option>
                    <option value="medical">🩺 Medical & Health (Protocols, Trials, Clinical)</option>
                  </select>
                </div>
              )}

              {/* Email */}
              {mode !== 'reset_password' && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/40 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* OTP Code (Only for reset_password) */}
              {mode === 'reset_password' && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    6-Digit Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter the code sent to your email"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/40 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
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
                        className="text-[11px] text-blue-500 hover:text-blue-400 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/40 border-white/15 text-white placeholder-slate-500'
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
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/40 border-white/15 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl ios-glass-btn-primary flex items-center justify-center space-x-2 text-xs font-bold shadow-lg mt-3"
              >
                <span>
                  {mode === 'login' ? 'Log In to Workspace' : 
                   mode === 'register' ? 'Create Free Account' : 
                   mode === 'forgot_password' ? 'Send Reset Code' : 
                   'Update Password & Sign In'}
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
                    className="text-xs text-blue-500 hover:underline transition font-semibold"
                  >
                    Back to Log In
                  </button>
                </div>
              )}
            </form>

            {/* Security Guarantee */}
            <div className="text-center pt-2 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Private · Your notes stay safely on your device</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

