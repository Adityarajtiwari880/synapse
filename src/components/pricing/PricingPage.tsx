import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building,
  Users,
  Sparkles,
  Calculator,
  HelpCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const PricingPage: React.FC = () => {
  const { navigateTo } = useWorkspace();

  // ROI Calculator State
  const [teamSize, setTeamSize] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(450);

  const hoursSavedPerPersonWeek = 4.2;
  const totalWeeklyHours = Math.round(teamSize * hoursSavedPerPersonWeek);
  const totalMonthlySavings = Math.round(totalWeeklyHours * 4.33 * hourlyRate);

  const [inquirySent, setInquirySent] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 bg-[#0c0d16]/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight">Synapse Enterprise Plans</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-semibold">
                Transparent
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Zero-Budget Default · Scale as You Grow</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-3.5 py-1.5 rounded-xl border border-white/15 text-slate-300 hover:text-white transition"
          >
            Matters Hub
          </button>
          <button
            onClick={() => navigateTo('workspace')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-apple-glow transition flex items-center space-x-1.5"
          >
            <span>Launch Free Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guaranteed Zero-Budget Default</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Predictable Plans for Modern Research
          </h1>
          <p className="text-sm text-slate-400">
            Start entirely free with 100% on-device privacy. Upgrade only when you need real-time multi-attorney deal rooms or air-gapped enterprise compliance.
          </p>
        </div>

        {/* PRICING TIERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TIER 1: COMMUNITY LOCAL */}
          <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                100% Local-First
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Community Local</h3>
                <div className="text-3xl font-extrabold text-white mt-2">
                  $0 <span className="text-xs text-slate-400 font-normal">/ forever</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Full-featured spatial research directly in your browser.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited local documents & PDF reading</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Two-Mode Liquid Squeeze Engine</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Apple Pencil inking with palm rejection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Click Word (.doc) memo export</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>BYOK API Keys (Gemini, OpenAI, Ollama)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigateTo('workspace')}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
            >
              Launch Now (No Sign Up)
            </button>
          </div>

          {/* TIER 2: TEAM PRO (FEATURED) */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-blue-900/30 via-[#0e1424] to-[#07080f] border-2 border-blue-500/50 shadow-2xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-apple-glow">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Collaborative
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Team Pro</h3>
                <div className="text-3xl font-extrabold text-white mt-2">
                  $24 <span className="text-xs text-slate-400 font-normal">/ user / month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Real-time collaboration for law firms and labs.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200 border-t border-white/10 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Everything in Community Local</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Live multi-user cursor & camera follow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Shared Matter Dossiers & Deal Rooms</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Card comment threads & assignment tags</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Unlimited version history & rollbacks</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigateTo('auth')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-apple-glow hover:brightness-110 transition flex items-center justify-center space-x-1.5"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIER 3: ENTERPRISE AIR-GAPPED */}
          <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Air-Gapped & FedRAMP
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Enterprise Dedicated</h3>
                <div className="text-3xl font-extrabold text-white mt-2">Custom</div>
                <p className="text-xs text-slate-400 mt-1">Air-gapped on-premise appliance & corporate SSO.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Okta, Microsoft Entra & SAML 2.0 SSO</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom BAA & Data Processing Addendum</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Offline Air-Gapped Local Cluster</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated Solutions Architect & 99.99% SLA</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>

        {/* INTERACTIVE ROI & HOURS SAVED CALCULATOR */}
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Enterprise ROI Calculator</h2>
              <p className="text-xs text-slate-400">
                Estimate billable time and cognitive capacity unlocked across your legal or research group.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 items-center">
            <div className="space-y-6">
              {/* Slider 1: Team Size */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Team Size (Attorneys / Investigators)</span>
                  <span className="text-cyan-300 font-bold">{teamSize} professionals</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={teamSize}
                  onChange={e => setTeamSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Slider 2: Hourly Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Average Billable / Valued Hourly Rate</span>
                  <span className="text-cyan-300 font-bold">${hourlyRate} / hour</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1200}
                  step={25}
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-black to-[#07080f] border border-blue-500/30 text-center space-y-4">
              <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Estimated Monthly Value Unlocked
              </div>
              <div className="text-4xl font-extrabold text-white tracking-tight">
                ${totalMonthlySavings.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300">
                Equal to <span className="text-cyan-300 font-bold">{totalWeeklyHours * 4} hours</span> of deep document synthesis saved per month across your team.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SALES INQUIRY MODAL */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0e101a] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Request Enterprise Dedicated Consultation</h3>
            <p className="text-xs text-slate-400">
              Speak with an enterprise architect regarding air-gapped deployments, custom BAAs, and SSO provisioning.
            </p>

            {inquirySent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Thank you! An enterprise specialist will contact your office within 2 business hours.</span>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setInquirySent(true);
                  setTimeout(() => {
                    setIsInquiryModalOpen(false);
                    setInquirySent(false);
                  }, 2500);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Firm</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skadden / Mayo Clinic"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="counsel@firm.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-apple-glow"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
