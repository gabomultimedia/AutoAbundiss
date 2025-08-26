import { create } from 'zustand';
import { checkAuth, login as authLogin, logout as authLogout } from '../lib/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: string | null;
  error: string | null;
  
  // Actions
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const isAuth = await checkAuth();
      set({ 
        isAuthenticated: isAuth, 
        user: isAuth ? 'AdminAbundiss' : null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isAuthenticated: false, 
        user: null, 
        error: 'Error verificando autenticación',
        isLoading: false 
      });
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await authLogin(username, password);
      if (success) {
        set({ 
          isAuthenticated: true, 
          user: username, 
          isLoading: false 
        });
        return true;
      } else {
        set({ 
          error: 'Credenciales inválidas', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Error durante el login', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authLogout();
      set({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Error durante el logout', 
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
