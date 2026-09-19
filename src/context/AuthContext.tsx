import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Aditya Raj Tiwari',
    email: 'aditya@synapse.ai',
    role: 'admin',
    status: 'active',
    createdAt: '2026-09-01',
    lastActive: 'Just now'
  },
  {
    id: 'usr-res1',
    name: 'Dr. Elena Rostova',
    email: 'elena@oxford.edu',
    role: 'researcher',
    status: 'active',
    createdAt: '2026-09-05',
    lastActive: '15m ago'
  },
  {
    id: 'usr-rev1',
    name: 'Marcus Vance',
    email: 'marcus@mit.edu',
    role: 'reviewer',
    status: 'active',
    createdAt: '2026-09-10',
    lastActive: '2h ago'
  },
  {
    id: 'usr-view1',
    name: 'Sophie Lin',
    email: 'sophie@stanford.edu',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-09-12',
    lastActive: '1d ago'
  }
];

const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-1',
    userId: 'usr-admin',
    userName: 'Aditya Raj Tiwari',
    device: 'MacBook Pro 16" (M3 Max)',
    browser: 'Safari 18.1 · macOS Sequoia',
    ip: '192.168.1.104',
    lastActive: 'Active Now',
    isCurrent: true
  },
  {
    id: 'sess-2',
    userId: 'usr-admin',
    userName: 'Aditya Raj Tiwari',
    device: 'iPad Pro 13" (M4 OLED)',
    browser: 'Mobile Safari · iPadOS 18',
    ip: '192.168.1.112',
    lastActive: '24m ago',
    isCurrent: false
  },
  {
    id: 'sess-3',
    userId: 'usr-res1',
    userName: 'Dr. Elena Rostova',
    device: 'Dell XPS 15 (Windows 11)',
    browser: 'Chrome 128.0',
    ip: '142.250.180.45',
    lastActive: '15m ago',
    isCurrent: false
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('synapse_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    const saved = localStorage.getItem('synapse_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('synapse_current_user_id');
    if (savedId) {
      const match = users.find(u => u.id === savedId);
      if (match) return match;
    }
    return users[0]; // Default to Aditya (admin) for full capability access
  });

  useEffect(() => {
    localStorage.setItem('synapse_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('synapse_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('synapse_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('synapse_current_user_id');
    }
  }, [currentUser]);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (user.status === 'suspended') {
        alert('Account suspended. Contact workspace administrator.');
        return false;
      }
      setCurrentUser(user);
      return true;
    }
    // Auto-create researcher if not found
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'researcher',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now'
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return true;
  };

  const register = async (name: string, email: string, _pass: string): Promise<boolean> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'researcher',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now'
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return true;
  };

  const loginWithPasskey = async (): Promise<boolean> => {
    // Apple Touch ID / Face ID WebAuthn API Simulation with haptic delay
    await new Promise(res => setTimeout(res, 400));
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    setCurrentUser(adminUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserRole = (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const killSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // RBAC Privileges
  const canEditCanvas = currentUser?.role === 'admin' || currentUser?.role === 'researcher';
  const canRunAgents = currentUser?.role === 'admin' || currentUser?.role === 'researcher';
  const canAccessAdmin = currentUser?.role === 'admin';

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
        canAccessAdmin
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
