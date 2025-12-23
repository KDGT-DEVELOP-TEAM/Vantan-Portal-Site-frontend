// src/api/axiosInstance.js
import axios from 'axios';

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
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 認証切れならログアウトさせてログインへ
          localStorage.clear();
          window.location.href = '/login';
          break;
        case 403:
          // 権限エラーなら 403 ページへ
          window.location.href = '/403';
          break;
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;