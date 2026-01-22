// src/api/homeApi.js
import axiosInstance from '@/api/axiosInstance';

export const homeApi = {
  fetchHomePageData() {
    return axiosInstance.get('/api/homepage/');
  }
};