import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  schoolId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true
    }),
  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false
    }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    })),
  setToken: (token) => set({ token }),
}));
