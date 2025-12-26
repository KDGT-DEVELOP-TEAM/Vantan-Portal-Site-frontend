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
          // 認証切れ：状態だけ破棄
          localStorage.clear();
          break;

        case 403:
          // 権限エラー：何もしない（router が判断）
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
