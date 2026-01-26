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
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// リフレッシュ処理中のリクエストを待機させるための変数
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  // 既に Login にいるなら遷移しない
  if (router.currentRoute.value.name !== 'Login') {
    router.push({ name: 'Login' });
  }
};

// レスポンスインターセプター（※ここは1回だけ定義する）
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    // ネットワークエラー等で response が無い場合
    if (!error?.response) return Promise.reject(error);

    const { status, data } = error.response;
    const code = data?.code;

    const originalRequest = error.config || {};
    originalRequest.headers = originalRequest.headers || {};

    // 401: 即ログアウト（develop の意図）
    // ※refreshを試す設計にしたいなら、401も refresh 対象にするが、今は要件通り即ログアウトに寄せる
    if (status === 401) {
      clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    // 403 + token_not_valid の場合のみ refresh を試みる（feature の意図）
    // ※_retry で無限ループ防止
    const shouldTryRefresh =
      status === 403 &&
      code === 'token_not_valid' &&
      !originalRequest._retry;

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    // すでに refresh 中なら、キューに積んで完了後に再実行
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // refreshToken が無いなら復旧不能 → ログアウト
      processQueue(error, null);
      clearAuth();
      redirectToLogin();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      // ここは request interceptor が accessToken を付けるので、
      // refresh では Authorization が付いても大抵問題ないが、
      // バックが嫌がる場合は下記のように headers を上書きして外すのもアリ：
      // const rs = await axiosInstance.post('/api/auth/refresh/', { refresh: refreshToken }, { headers: { Authorization: '' } });

      const rs = await axiosInstance.post('/api/auth/refresh/', {
        refresh: refreshToken,
      });

      const access = rs.data?.access;
      if (!access) throw new Error('Refresh succeeded but access token missing');

      localStorage.setItem('accessToken', access);

      // 待機中リクエストを再開
      processQueue(null, access);

      // 自分自身のリクエストも再実行
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
