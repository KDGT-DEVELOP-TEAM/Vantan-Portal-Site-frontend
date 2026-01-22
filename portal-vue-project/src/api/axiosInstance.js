// src/api/axiosInstance.js
import axios from 'axios';
import { clearAuth } from '@/store/authState.js';
import router from '@/router';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// accessToken を自動付与
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      clearAuth();
      if (router.currentRoute.value.name !== 'Login') {
        router.push({ name: 'Login' });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;