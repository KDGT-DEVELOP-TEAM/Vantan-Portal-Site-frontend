// src/api/authApi.js
import axios from './axiosInstance';

const LOGOUT_ENDPOINT = '/api/auth/logout/';

export const authApi = {
  logout(refreshToken) {
    return axios.post(LOGOUT_ENDPOINT, {
      refresh: refreshToken,
    });
  },
};
