import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => set({
    user,
    accessToken,
    isAuthenticated: true,
    isLoading: false,
  }),

  // Update only the user without wiping the access token
  setUser: (user) => set((state) => ({
    user,
    isAuthenticated: true,
    isLoading: false,
    accessToken: state.accessToken, // preserve whatever token is already stored
  })),

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: () => set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  setLoading: (isLoading) => set({ isLoading }),
}));
