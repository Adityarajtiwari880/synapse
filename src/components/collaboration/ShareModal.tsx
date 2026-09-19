import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Globe,
  Lock,
  Users,
  Eye,
  Edit3,
  MessageSquare,
  Sparkles,
  Radio
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { collaborators, addAuditLog } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [rolePermission, setRolePermission] = useState<'editor' | 'commenter' | 'viewer'>('editor');
  const [followingId, setFollowingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl = `https://synapse.ai/w/attn-mamba-synthesis?role=${rolePermission}&invite=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addAuditLog('collaborate_share', `Generated live collaborative share link with "${rolePermission}" permissions.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFollow = (collabId: string, name: string) => {
    if (followingId === collabId) {
      setFollowingId(null);
      alert('Exited Follow Mode. Camera is free.');
    } else {
      setFollowingId(collabId);
      alert(`🎥 Follow Mode Active: Your viewport is now locked to ${name}'s navigation!`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-7 border border-white/15 shadow-2xl relative space-y-6">
        {/* Dismiss */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-apple-glow">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Collaborate & Share Canvas</h2>
            <p className="text-xs text-slate-400">Invite colleagues to co-read, extract excerpts, and verify claims in real-time</p>
          </div>
        </div>

        {/* Invite Link Generator */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Live Workspace Link
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 glass-panel rounded-xl px-3.5 py-2.5 flex items-center space-x-2 text-xs text-slate-200 border border-white/10 truncate font-mono">
              <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{shareUrl}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-apple-glow transition flex items-center space-x-1.5 shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Access Permissions Picker */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Anyone with link can:</span>
            <div className="flex p-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px]">
              <button
                onClick={() => setRolePermission('editor')}
                className={`px-2.5 py-1 rounded-md transition ${rolePermission === 'editor' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Edit & Ink
              </button>
              <button
                onClick={() => setRolePermission('commenter')}
                className={`px-2.5 py-1 rounded-md transition ${rolePermission === 'commenter' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Comment Only
              </button>
              <button
                onClick={() => setRolePermission('viewer')}
                className={`px-2.5 py-1 rounded-md transition ${rolePermission === 'viewer' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                View Only
              </button>
            </div>
          </div>
        </div>

        {/* Live Collaborators Presence */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active in this Session ({collaborators.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-400 flex items-center font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              CRDT Synced (Peer-to-Peer)
            </span>
          </div>

          <div className="space-y-2">
            {collaborators.map(c => (
              <div
                key={c.id}
                className="glass-card rounded-2xl p-3 flex items-center justify-between transition hover:border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md relative"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name.charAt(0)}
                    {c.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center space-x-1.5">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize font-mono">({c.role})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {c.isOnline ? 'Viewing Multi-Head Attention p.4' : 'Offline'}
                    </p>
                  </div>
                </div>

                {c.isOnline && (
                  <button
                    onClick={() => handleToggleFollow(c.id, c.name)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition flex items-center space-x-1 border ${
                      followingId === c.id
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-ghost-glow'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3 h-3" />
                    <span>{followingId === c.id ? 'Following' : 'Follow'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Cryptographic Note */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-start space-x-2 text-[11px] text-slate-400 leading-normal">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            End-to-End Local Encryption: Document PDFs remain stored in local OPFS. Collaborators only exchange encrypted CRDT delta vectors via WebRTC/BroadcastChannel.
          </span>
        </div>
      </div>
    </div>
  );
};
