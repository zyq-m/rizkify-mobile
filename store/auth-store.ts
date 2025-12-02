import { LoginRes, Token, User } from '@/api/service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState extends Partial<LoginRes> {
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: Partial<User>, token: Token) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  updateToken: (token: Token) => void;

  getToken: () => Token | undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () => {
        // Clear Zustand's persisted storage
        AsyncStorage.removeItem('auth-storage');
        // Reset state
        set({
          user: undefined,
          token: undefined,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : undefined,
        })),

      updateToken: (token) => set((state) => ({ token: token })),
      setLoading: (loading) => set({ isLoading: loading }),

      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
