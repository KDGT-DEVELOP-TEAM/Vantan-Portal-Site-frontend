// src/api/auth.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * パスワード再設定メール送信
 */
export const requestPasswordResetApi = (email) => {
  return axios.post(`${API_BASE_URL}/api/users/password/reset/`, {
    email,
  });
};

/**
 * パスワード再設定確定
 */
export const confirmPasswordResetApi = ({ uid, token, newPassword }) => {
  return axios.post(
    `${API_BASE_URL}/api/users/password/confirm/`,
    {
      uid,
      token,
      new_password: newPassword,
    }
  );
};
