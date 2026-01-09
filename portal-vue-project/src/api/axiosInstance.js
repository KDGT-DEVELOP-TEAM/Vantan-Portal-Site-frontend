// src/api/axiosInstance.js
import axios from 'axios';
import { clearAuth } from '@/store/authState.js';
import router from '@/router';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8085',
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
  response => response,
  error => {
    // 401(認証切れ) または 403(権限なし) の場合
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuth();

      if (router.currentRoute.value.name !== 'Login') {
        router.push({ name: 'Login' });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;