import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: { username?: string; avatar?: string }) => Promise<void>;
  updateSettings: (data: {
    volcengineAccessKey?: string;
    volcengineSecretKey?: string;
    volcengineModelEndpointId?: string;
    defaultMood?: string;
    notificationsEnabled?: boolean;
    dataEncryptionEnabled?: boolean;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', response.token);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '登录失败';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, password, username });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', response.token);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '注册失败';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      fetchCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isLoading: false, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          localStorage.removeItem('token');
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.updateProfile(data);
          set({ user, isLoading: false });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '更新个人信息失败';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateSettings: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.updateSettings(data);
          set({ user, isLoading: false });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '更新设置失败';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword({ currentPassword, newPassword });
          set({ isLoading: false });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : '修改密码失败';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
