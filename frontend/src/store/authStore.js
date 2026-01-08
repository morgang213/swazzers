import { create } from 'zustand';
import apiClient from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const data = await apiClient.login(email, password);
      set({ 
        user: data.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    }
  },

  checkAuth: () => {
    const token = apiClient.getToken();
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      } catch (error) {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
