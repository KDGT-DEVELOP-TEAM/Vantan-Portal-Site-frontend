// src/api/userManagementApi.js
import axiosInstance from '@/api/axiosInstance';

export const userApi = {
  // 一覧取得
  list() {
    return axiosInstance.get('/api/users/');
  },
  // ユーザー作成
  create(payload) {
    return axiosInstance.post('/api/users/', payload);
  },
  // 更新 (fetch の PATCH をリプレイス)
  update(id, data) {
    return axiosInstance.patch(`/api/users/${id}/`, data);
  },
  // 削除
  delete(id) {
    return axiosInstance.delete(`/api/users/${id}/`);
  },
  // 一括作成用
  bulkGenerate(payload) {
    return axiosInstance.post('/api/users/bulk_generate/', payload);
  },
  bulkUpload(formData) {
    return axiosInstance.post('/api/users/bulk_upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
