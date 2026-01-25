// src/store/authState.js
import { reactive } from 'vue';
import axiosInstance from '@/api/axiosInstance';

export const authState = reactive({
  token: localStorage.getItem('accessToken'),
  authenticated: false, 
  authChecked: false,   
});

/**
 * 初期認証チェック
 */
export async function checkAuth() {
  const token = localStorage.getItem('accessToken');
  authState.token = token;

  if (!token) {
    authState.authenticated = false;
    authState.authChecked = true;
    return;
  }

  try {
    // 末尾スラッシュの有無はDjangoの設定に合わせる（重要）
    await axiosInstance.get('/api/auth/user/'); 
    authState.authenticated = true;
  } catch (error) {
    const status = error?.response?.status;
    // 401/403の場合は明確に認証切れなのでクリア
    if (status === 401 || status === 403) {
      clearAuth();
    } else {
      // ネットワークエラーなどはauthenticatedだけfalseにしてtokenは残す
      authState.authenticated = false;
    }
  } finally {
    authState.authChecked = true;
  }
}

/**
 * axiosInstance から呼ばれる関数（SyntaxError 対策）
 */
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function setAuthenticated(value = true) {
  authState.authenticated = value;
}

/**
 * 認証情報のクリア
 */
export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('userId');

  authState.token = null;
  authState.authenticated = false;
  authState.authChecked = true;
}