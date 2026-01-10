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

// リクエスト interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンス interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn('認証切れ、または権限エラー', {
        url: error.config?.url,
        status,
      });

      // セッション破棄
      clearAuth();

      // ログイン画面へリダイレクト
      if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login' });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
