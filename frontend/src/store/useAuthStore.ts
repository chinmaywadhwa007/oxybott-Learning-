import { create } from 'zustand';
import { apiFetch } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  magicLinkSent: boolean;
  resetSent: boolean;

  // Actions
  setError: (error: string | null) => void;
  clearState: () => void;
  checkAuthSession: () => Promise<boolean>;
  signup: (name: string, username: string, email: string, pass: string) => Promise<boolean>;
  login: (emailOrUsername: string, pass: string) => Promise<{ success: boolean }>;
  sendMagicLink: (email: string) => Promise<boolean>;
  verifyMagicLink: (token: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
}

const GUEST_USER: AuthUser = {
  id: 'guest-user-1',
  email: 'guest@oxybott.local',
  username: 'Guest Developer',
  name: 'Guest Developer',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: GUEST_USER,
  token: 'guest_token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  magicLinkSent: false,
  resetSent: false,

  setError: (error) => set({ error }),
  clearState: () => set({ error: null, magicLinkSent: false, resetSent: false }),

  checkAuthSession: async () => {
    set({
      user: GUEST_USER,
      isAuthenticated: true,
      error: null,
    });
    return true;
  },

  signup: async (name, username, email, password) => {
    set({ isLoading: true, error: null });
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password }),
    });

    set({ isLoading: false });

    if (res.error) {
      set({ error: res.error });
      return false;
    }

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('oxybott_token', res.data.token);
      set({
        token: res.data.token,
        user: res.data.user,
        isAuthenticated: true,
        error: null,
      });
      return true;
    }
    return false;
  },

  login: async (emailOrUsername, password) => {
    set({ isLoading: true, error: null });
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });

    set({ isLoading: false });

    if (res.error) {
      set({ error: res.error });
      return { success: false };
    }

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('oxybott_token', res.data.token);
      set({
        token: res.data.token,
        user: res.data.user,
        isAuthenticated: true,
        error: null,
      });
      return { success: true };
    }

    return { success: false };
  },

  sendMagicLink: async (email: string) => {
    set({ isLoading: true, error: null, magicLinkSent: false });
    const res = await apiFetch('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    set({ isLoading: false });

    if (res.error) {
      set({ error: res.error });
      return false;
    }

    set({ magicLinkSent: true, error: null });
    return true;
  },

  verifyMagicLink: async (token: string) => {
    set({ isLoading: true, error: null });
    const res = await apiFetch('/auth/magic-link/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    set({ isLoading: false });

    if (res.error) {
      set({ error: res.error });
      return false;
    }

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('oxybott_token', res.data.token);
      set({
        token: res.data.token,
        user: res.data.user,
        isAuthenticated: true,
        error: null,
      });
      return true;
    }

    return false;
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null, resetSent: false });
    const res = await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    set({ isLoading: false });

    if (res.error) {
      set({ error: res.error });
      return false;
    }

    set({ resetSent: true, error: null });
    return true;
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    const res = await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    set({ isLoading: false });

    if (res.error) {
      set({ error: res.error });
      return false;
    }

    return true;
  },

  logout: () => {
    localStorage.removeItem('oxybott_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      magicLinkSent: false,
      resetSent: false,
    });
  },
}));
