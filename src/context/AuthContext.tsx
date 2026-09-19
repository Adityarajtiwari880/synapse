import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Role, ActiveSession } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  activeSessions: ActiveSession[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginWithPasskey: () => Promise<boolean>;
  logout: () => void;
  switchUserRole: (userId: string, newRole: Role) => void;
  toggleUserStatus: (userId: string) => void;
  killSession: (sessionId: string) => void;
  canEditCanvas: boolean;
  canRunAgents: boolean;
  canAccessAdmin: boolean;
  supabaseUserId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('synapse_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    const saved = localStorage.getItem('synapse_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── On mount: restore session from Supabase OR localStorage ──
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local-only mode: restore from localStorage
      const savedId = localStorage.getItem('synapse_current_user_id');
      if (savedId) {
        const match = users.find((u) => u.id === savedId);
        if (match) setCurrentUser(match);
      }
      setLoading(false);
      return;
    }

    // Supabase mode: restore session and listen for auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        loadProfile(session.user.id, session.user.email ?? '');
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        loadProfile(session.user.id, session.user.email ?? '');
      } else {
        setCurrentUser(null);
        setSupabaseUserId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async (uid: string, email: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (data) {
      const user: User = {
        id: uid,
        name: data.name,
        email: data.email,
        role: data.role as Role,
        status: 'active',
        createdAt: data.created_at,
        lastActive: 'Just now',
      };
      setCurrentUser(user);
    } else {
      // Profile not yet created (trigger may still be running)
      setCurrentUser({
        id: uid,
        name: email.split('@')[0],
        email,
        role: 'researcher',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: 'Just now',
      });
    }
    setLoading(false);
  };

  // ─── Fetch All Profiles for Admin Portal ──────────────────
  useEffect(() => {
    if (isSupabaseConfigured && currentUser?.role === 'admin') {
      supabase.from('profiles').select('*').then(({ data }) => {
        if (data) {
          const mappedUsers: User[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role as Role,
            status: 'active',
            createdAt: d.created_at,
            lastActive: 'Recently'
          }));
          setUsers(mappedUsers);
        }
      });
    }
  }, [currentUser]);

  // ─── Persist local users ──────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('synapse_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (!isSupabaseConfigured && currentUser) {
      localStorage.setItem('synapse_current_user_id', currentUser.id);
    }
  }, [currentUser]);

  // ─── LOGIN ────────────────────────────────────────────────
  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      // Local mock login
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        if (user.status === 'suspended') {
          alert('Account suspended. Contact workspace administrator.');
          return false;
        }
        setCurrentUser(user);
        return true;
      }
      // Auto-create new user
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'researcher',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      return true;
    }

    // Supabase login
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  };

  // ─── REGISTER ─────────────────────────────────────────────
  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        role: 'researcher',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      return true;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name } },
    });
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  };

  // ─── PASSKEY (Apple Touch ID simulation) ─────────────────
  const loginWithPasskey = async (): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 400));
    if (!isSupabaseConfigured) {
      const adminUser = users.find((u) => u.role === 'admin') || users[0];
      setCurrentUser(adminUser);
      return true;
    }
    // Future: WebAuthn via supabase.auth.signInWithOtp / passkey API
    const adminUser = users.find((u) => u.role === 'admin') || users[0];
    setCurrentUser(adminUser);
    return true;
  };

  // ─── LOGOUT ───────────────────────────────────────────────
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setSupabaseUserId(null);
    localStorage.removeItem('synapse_current_user_id');
  };

  // ─── Admin: role & status management ─────────────────────
  const switchUserRole = (userId: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const killSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // ─── RBAC privileges ──────────────────────────────────────
  const canEditCanvas = currentUser?.role === 'admin' || currentUser?.role === 'researcher';
  const canRunAgents = currentUser?.role === 'admin' || currentUser?.role === 'researcher';
  const canAccessAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 animate-pulse" />
          <p className="text-xs text-slate-400">Loading Synapse…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        activeSessions,
        isAuthenticated: !!currentUser,
        login,
        register,
        loginWithPasskey,
        logout,
        switchUserRole,
        toggleUserStatus,
        killSession,
        canEditCanvas,
        canRunAgents,
        canAccessAdmin,
        supabaseUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
