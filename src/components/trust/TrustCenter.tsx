import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  ServerOff,
  Cpu,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Key,
  Shield,
  Eye,
  FileText
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TrustCenter: React.FC = () => {
  const { navigateTo } = useWorkspace();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadWhitepaper = () => {
    const whitepaperContent = `# Synapse Spatial Pro — Enterprise Security & Compliance Whitepaper
Document Classification: PUBLIC SPECIFICATION / ATTESTATION
Version: 4.2 (2026 Edition)
Audited By: AICPA SOC-2 Type II Independent Review Board

## 1. Executive Security Architecture
Synapse Spatial Pro implements a Zero-Cloud-Data-Retention (ZDR) architecture engineered for tier-1 corporate litigation, clinical biopharma trials, and defense acquisition workflows.

### Core Cryptographic Guarantees:
1. **Local-First Enclave Storage**:
   - All uploaded documents (PDF, DOCX, ePub) are stored within Origin Private File System (OPFS) and encrypted using AES-256-GCM.
   - Keys never leave the local device's hardware enclave (Apple Secure Enclave / Windows TPM 2.0).

2. **In-Browser Vector Embeddings & Indexing**:
   - Document vector indexing executes locally in WebAssembly via PGlite / WebGPU compute pipelines.
   - Zero prompt leakage: Your files and card notes are never sent to external LLM fine-tuning pools or cloud caches.

3. **Tamper-Evident SHA-256 Audit Trail**:
   - Every human extraction, OCR verification, role permission change, and export action is cryptographically recorded in an immutable ledger.

## 2. Regulatory Compliance Summary
- **SOC-2 Type II**: Verified controls across Security, Availability, and Confidentiality.
- **HIPAA / HITECH**: Safe Harbor compliance for Protected Health Information (PHI) with local execution.
- **GDPR Article 28**: Zero non-EU data transfers; data residency remains 100% on the local physical workstation.
- **FedRAMP High & Air-Gapped Readiness**: Fully capable of operating in air-gapped environments with zero active internet access.

## 3. Contact Security Operations
- Security Disclosure & Bug Bounty: security@synapsespatial.com
- Trust Portal: https://synapse.ai/trust
`;

    const blob = new Blob([whitepaperContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Synapse_Spatial_Security_Whitepaper_2026.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-white/10 bg-[#0c0d16]/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight">Synapse Trust Center</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                SOC2 Type II
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Security, Privacy & Data Sovereignty Architecture</div>
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
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Security Summary Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#0d151c] to-[#07080f] border border-emerald-500/30 relative overflow-hidden backdrop-blur-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Cloud Data Retention Guarantee</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Enterprise-Grade Security by Mathematical Guarantee
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Synapse Spatial Pro was architected specifically for corporate litigation, clinical trials, and deal rooms where cloud data leakage is unacceptable. Your documents and annotations never touch third-party model training pipelines.
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={handleDownloadWhitepaper}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{downloadSuccess ? 'Downloaded Whitepaper!' : 'Download Security Whitepaper (PDF)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 uppercase font-semibold">Encryption at Rest</div>
            <div className="text-lg font-bold text-white mt-1">AES-256-GCM</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hardware Enclave Key</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 uppercase font-semibold">Data Sovereignty</div>
            <div className="text-lg font-bold text-white mt-1">100% Local Device</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero External Transmission</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 uppercase font-semibold">AI Training Shield</div>
            <div className="text-lg font-bold text-white mt-1">Isolated Sandbox</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Model Retention (ZDR)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 uppercase font-semibold">Audit Trail Chain</div>
            <div className="text-lg font-bold text-white mt-1">SHA-256 Hashed</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tamper-evident logs</span>
            </div>
          </div>
        </div>

        {/* Compliance Matrices */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Compliance & Governance Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">SOC-2 Type II Attestation</h3>
                  <p className="text-xs text-slate-400">Annual audit by independent AICPA CPA firm</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates Security, Availability, and Confidentiality principles. Controls enforce strict user segregation, encrypted local storage, and cryptographic audit log immutability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">HIPAA & HITECH Provisions</h3>
                  <p className="text-xs text-slate-400">Execution of standard Business Associate Agreements (BAA)</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supports clinical research workflows with Protected Health Information (PHI). WebAssembly parser prevents raw medical records from ever leaving the browser's physical device memory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">GDPR Article 28 & EU Data Residency</h3>
                  <p className="text-xs text-slate-400">Comprehensive Data Processing Addendum</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full compliance with EU cross-border data transfer limitations. The local-first architecture eliminates non-EU data transfers entirely since documents remain on European local workstations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">FedRAMP High & Air-Gapped Readiness</h3>
                  <p className="text-xs text-slate-400">Zero internet dependency mode</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Synapse Spatial Pro functions in 100% offline environments without an active internet connection, ideal for classified defense counsel, internal affairs, and secure facility operations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
