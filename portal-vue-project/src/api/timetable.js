// src/api/timetableApi.js
import axios from './axiosInstance';

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
