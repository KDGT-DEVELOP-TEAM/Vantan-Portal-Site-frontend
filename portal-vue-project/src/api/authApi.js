// src/api/authApi.js
import axiosInstance from './axiosInstance';

export const authApi = {
  login(email, password) {
    return axiosInstance.post('/api/auth/login/', { email, password });
  },

  fetchUserInfo() {
    return axiosInstance.get('/api/auth/user/');
  },

  logout(refreshToken) {
    if (!refreshToken) {
      return Promise.resolve({ skipped: true });
    }
  
    return axiosInstance.post('/api/auth/logout/', {
      refresh: refreshToken,
    });
  }  
};
