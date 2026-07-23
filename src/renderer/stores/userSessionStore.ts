import { create } from 'zustand';
import { UserRole, AuthSessionData } from '../../shared/types';
import { electronBridge } from '../../preload/bridge';

export interface UserSessionState {
  userId: number | null;
  role: UserRole;
  username: string;
  fullName: string;
  sessionToken: string | null;
  isAuthenticated: boolean;
  loginTime: string | null;
  permissions: string[];
  setRole: (role: UserRole) => void;
  setUsername: (name: string) => void;
  setAuthenticated: (status: boolean) => void;
  setSession: (session: AuthSessionData) => void;
  loginWithCredentials: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useUserSessionStore = create<UserSessionState>((set, get) => ({
  userId: 2,
  role: 'ADMIN',
  username: 'admin',
  fullName: 'Enterprise Admin',
  sessionToken: localStorage.getItem('mz_session_token') || null,
  isAuthenticated: true,
  loginTime: new Date().toISOString(),
  permissions: ['*'],

  setRole: (role) => set({ role }),
  setUsername: (username) => set({ username }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setSession: (session: AuthSessionData) => {
    if (session.sessionToken) {
      localStorage.setItem('mz_session_token', session.sessionToken);
    }
    set({
      userId: session.userId,
      role: session.roleName,
      username: session.username,
      fullName: session.fullName,
      sessionToken: session.sessionToken,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    });
  },

  loginWithCredentials: async (username, password, rememberMe = false) => {
    try {
      const res = await electronBridge.login({ username, password, rememberMe });
      if (res.success && res.data) {
        get().setSession(res.data);
        return { success: true };
      }
      return { success: false, message: res.error?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },

  restoreSession: async () => {
    const token = localStorage.getItem('mz_session_token');
    if (!token) {
      set({ isAuthenticated: false, sessionToken: null });
      return false;
    }

    try {
      const res = await electronBridge.validateSession(token);
      if (res.success && res.data) {
        get().setSession(res.data);
        return true;
      }
      localStorage.removeItem('mz_session_token');
      set({ isAuthenticated: false, sessionToken: null });
      return false;
    } catch {
      localStorage.removeItem('mz_session_token');
      set({ isAuthenticated: false, sessionToken: null });
      return false;
    }
  },

  logout: async () => {
    const token = get().sessionToken;
    if (token) {
      await electronBridge.logout(token);
    }
    localStorage.removeItem('mz_session_token');
    set({
      userId: null,
      role: 'VIEWER',
      username: 'Guest',
      fullName: 'Guest User',
      sessionToken: null,
      isAuthenticated: false,
      loginTime: null,
      permissions: [],
    });
  },
}));
