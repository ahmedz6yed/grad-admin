import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: !!token }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
        })),
    }),
    {
      name: 'fixpay-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        isAuthenticated: !!(persistedState && persistedState.token),
      }),
    }
  )
);
