// src/store/authState.js
import { reactive } from 'vue';
import axiosInstance from '@/api/axiosInstance';

export const authState = reactive({
  token: localStorage.getItem('accessToken'),
  authenticated: false,
  authChecked: false,
});

export async function checkAuth() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    authState.authChecked = true;
    return;
  }
  
  authState.token = token;

  try {
    await axiosInstance.get('/api/auth/user/');
    authState.authenticated = true;
  } catch {
    clearAuth();
  } finally {
    authState.authChecked = true;
  }
}


export function setAuth(token) {
  localStorage.setItem('accessToken', token);
  authState.token = token;
  authState.authenticated = true;
  authState.authChecked = true;
}

export function clearAuth() {
  localStorage.clear();
  authState.token = null;
  authState.authenticated = false;
  authState.authChecked = true;
}
