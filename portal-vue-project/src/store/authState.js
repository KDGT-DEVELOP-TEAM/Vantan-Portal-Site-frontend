// src/store/authState.js
import { reactive } from 'vue';

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem('accessToken'),
});

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('userId');

  authState.isAuthenticated = false;
}

export function setAuth() {
  authState.isAuthenticated = true;
}
