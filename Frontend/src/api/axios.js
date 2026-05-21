import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5005/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        
        const res = await axios.post(
          'http://localhost:5005/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.data.accessToken;
        
        
        useAuthStore.getState().setAccessToken(newAccessToken);
        
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
