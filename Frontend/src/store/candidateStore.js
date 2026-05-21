import { create } from 'zustand';
import api from '../api/axios';

export const useCandidateStore = create((set) => ({
  candidates: [],
  stats: { total: 0, verified: 0, failed: 0, pending: 0, partial: 0 },
  recentActivity: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },
  loading: false,
  error: null,

  fetchCandidates: async (search = '', status = '', page = 1, limit = 50) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', limit);

      const res = await api.get(`/candidates?${params.toString()}`);
      set({
        candidates: res.data.data.candidates,
        pagination: res.data.data.pagination,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      set({ error: 'Failed to fetch candidates', loading: false });
    }
  },

  // Uses the dedicated /candidates/stats endpoint — accurate regardless of pagination
  fetchStats: async () => {
    try {
      const res = await api.get('/candidates/stats');
      set({
        stats: res.data.data.stats,
        recentActivity: res.data.data.recentActivity,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  updateCandidateStatus: (id, status) => {
    set((state) => ({
      candidates: state.candidates.map((c) => c.id === id ? { ...c, status } : c),
    }));
  },

  deleteCandidate: async (id) => {
    try {
      await api.delete(`/candidates/${id}`);
      set((state) => ({
        candidates: state.candidates.filter((c) => c.id !== id),
        stats: {
          ...state.stats,
          total: Math.max(0, state.stats.total - 1),
        },
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete candidate' };
    }
  },
}));
