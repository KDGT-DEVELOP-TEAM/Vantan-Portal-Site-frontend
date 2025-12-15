// src/api/timetable.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8085';
const TIMESCHEDULE_ENDPOINT = '/api/timeschedule/';

/**
 * 一覧取得
 */
export const fetchTimeSchedulesApi = (params, token) => {
  return axios.get(`${API_BASE_URL}${TIMESCHEDULE_ENDPOINT}`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
};

/**
 * 詳細取得
 */
export const fetchTimeScheduleDetailApi = (id, token) => {
  return axios.get(`${API_BASE_URL}${TIMESCHEDULE_ENDPOINT}${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * 削除
 */
export const deleteTimeScheduleApi = (id, token) => {
  return axios.delete(`${API_BASE_URL}${TIMESCHEDULE_ENDPOINT}${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * ダウンロード
 */
export const downloadTimeScheduleFileApi = (id, token) => {
  return axios.get(
    `${API_BASE_URL}${TIMESCHEDULE_ENDPOINT}${id}/?download=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    }
  );
};
