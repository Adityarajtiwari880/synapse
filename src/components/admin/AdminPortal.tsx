import React, { useState } from 'react';
import {
  Shield,
  Users,
  Key,
  Activity,
  Trash2,
  Download,
  AlertOctagon,
  CheckCircle2,
  HardDrive,
  Cpu,
  Monitor,
  Tablet,
  Smartphone,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Role } from '../../types';

export const AdminPortal: React.FC = () => {
  const {
    users,
    activeSessions,
    switchUserRole,
    toggleUserStatus,
    killSession
  } = useAuth();

  const { auditLogs, addAuditLog } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'audit' | 'tokens'>('users');
  const [auditFilter, setAuditFilter] = useState('');

  const filteredLogs = auditLogs.filter(
    l =>
      l.actorName.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.details.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.action.toLowerCase().includes(auditFilter.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: Role) => {
    switchUserRole(userId, newRole);
    addAuditLog('role_change', `Updated role for user ID: ${userId} to "${newRole}".`);
  };

  const handleSessionKill = (sessionId: string, device: string) => {
    killSession(sessionId);
    addAuditLog('session_kill', `Revoked remote session: ${device} (Session ID: ${sessionId}).`, 'warning');
  };

  return (
    <div className="h-full w-full p-6 md:p-10 overflow-y-auto z-20 select-none">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <Shield className="w-6 h-6 text-amber-400" />
              <span>Workspace Administration & Governance</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Control user privileges, monitor active hardware sessions, audit telemetry, and govern model token quotas.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Local-First Vault Secured
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 rounded-2xl glass-panel max-w-xl text-xs font-medium border border-white/10">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeTab === 'users' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & RBAC ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeTab === 'sessions' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Active Sessions ({activeSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeTab === 'audit' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Log</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-2 ${
              activeTab === 'tokens' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Tokens & Quotas</span>
          </button>
        </div>

        {/* ==================== TAB 1: USERS & RBAC ==================== */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-slate-300">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Assigned Role (RBAC)</th>
                  <th className="p-4 font-semibold">Account Status</th>
                  <th className="p-4 font-semibold">Last Active</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                        className="bg-black/40 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:border-blue-500 outline-none"
                      >
                        <option value="admin">Admin (Full Control)</option>
                        <option value="researcher">Researcher (Edit & Run Agents)</option>
                        <option value="reviewer">Reviewer (Comment & Verify)</option>
                        <option value="viewer">Viewer (Read-Only)</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">{u.lastActive}</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10 hover:bg-white/10 transition"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== TAB 2: ACTIVE SESSIONS ==================== */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(s => (
                <div key={s.id} className="glass-card rounded-2xl p-5 space-y-3 relative">
                  {s.isCurrent && (
                    <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                      This Device
                    </span>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                      {s.device.includes('iPad') ? (
                        <Tablet className="w-5 h-5" />
                      ) : (
                        <Monitor className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{s.device}</h4>
                      <p className="text-[11px] text-slate-400">{s.browser}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>User:</span>
                      <span className="text-white font-medium">{s.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="font-mono text-slate-300">{s.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Seen:</span>
                      <span>{s.lastActive}</span>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      onClick={() => handleSessionKill(s.id, s.device)}
                      className="w-full mt-2 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-medium transition flex items-center justify-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke & Sign Out Device</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: AUDIT LOG ==================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md glass-panel rounded-xl px-3 py-2 flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                  placeholder="Filter audit events..."
                  className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-slate-500"
                />
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `synapse_audit_log_${Date.now()}.json`;
                  a.click();
                }}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log</span>
              </button>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-slate-300">
                    <th className="p-3.5 font-semibold">Timestamp</th>
                    <th className="p-3.5 font-semibold">Actor</th>
                    <th className="p-3.5 font-semibold">Action Type</th>
                    <th className="p-3.5 font-semibold">Details</th>
                    <th className="p-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5 font-medium text-white">{log.actorName}</td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-blue-400 uppercase">{log.action}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-md truncate">{log.details}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: TOKENS & QUOTAS ==================== */}
        {activeTab === 'tokens' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Daily Token Consumption Governance</span>
              </h3>
              <p className="text-xs text-slate-400">
                Prevent model cost spikes by enforcing a daily token cap across all agents.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Daily Consumption:</span>
                  <span className="font-mono text-white font-semibold">142,500 / 500,000 tokens (28.5%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '28.5%' }}></div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Extraction Specialist (Small Model):</span>
                  <span className="font-mono text-emerald-400">85,200 tokens ($0.08)</span>
                </div>
                <div className="flex justify-between">
                  <span>Synthesis & Contradiction Finder:</span>
                  <span className="font-mono text-blue-400">57,300 tokens ($0.17)</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Origin Private File System (OPFS) Storage</span>
              </h3>
              <p className="text-xs text-slate-400">
                Local device storage quota for PDF blobs, chunk embeddings, and LRU tile bitmaps.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Storage Used:</span>
                  <span className="font-mono text-white font-semibold">248 MB / 4,096 MB (6.0%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>

              <button
                onClick={() => alert('Temporary tile bitmaps and cached embeddings purged from OPFS.')}
                className="mt-4 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition"
              >
                Clear Tile Cache & Rebuild Embeddings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
