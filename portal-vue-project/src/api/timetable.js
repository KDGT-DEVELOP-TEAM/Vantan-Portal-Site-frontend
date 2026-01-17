// src/api/timetableApi.js
import axios from '@/api/axiosInstance';

const TIMESCHEDULE_ENDPOINT = '/api/timeschedule/';

/**
 * 一覧取得
 */
export const fetchTimeSchedulesApi = (params) => {
  return axios.get(TIMESCHEDULE_ENDPOINT, { params });
};

/**
 * 詳細取得
 */
export const fetchTimeScheduleDetailApi = (id) => {
  return axios.get(`${TIMESCHEDULE_ENDPOINT}${id}/`);
};

/**
 * 作成（POST）
 */
export const createTimeScheduleApi = (formData) => {
  return axios.post('/api/timeschedule/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // 明示的に指定（場合によっては不要）
    }
  });
};

/**
 * 削除
 */
export const deleteTimeScheduleApi = (id) => {
  return axios.delete(`${TIMESCHEDULE_ENDPOINT}${id}/`);
};

/**
 * ダウンロード
 */
export const downloadTimeScheduleFileApi = (id) => {
  return axios.get(`${TIMESCHEDULE_ENDPOINT}${id}/?download=true`, {
    responseType: 'blob',
  });
};
