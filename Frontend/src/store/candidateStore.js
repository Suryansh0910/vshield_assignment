import { create } from 'zustand';
import api from '../api/axios';

export const useCandidateStore = create((set, get) => ({
  candidates: [],
  loading: false,
  error: null,

  fetchCandidates: async (search = '') => {
    set({ loading: true, error: null });
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/candidates${query}`);
      set({ candidates: res.data.data.candidates, loading: false });
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      set({ error: 'Failed to fetch candidates', loading: false });
    }
  },

  getStats: () => {
    const candidates = get().candidates;
    return {
      total:    candidates.length,
      verified: candidates.filter(c => c.status === 'VERIFIED').length,
      partial:  candidates.filter(c => c.status === 'PARTIAL').length,
      pending:  candidates.filter(c => c.status === 'PENDING').length,
      failed:   candidates.filter(c => c.status === 'FAILED').length,
    };
  },
}));
