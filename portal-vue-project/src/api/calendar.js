// src/api/calendar.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8085';
const HOMEPAGE_ENDPOINT = '/api/homepage/';

/**
 * カレンダーURL取得
 */
export const fetchCalendarUrlApi = (token) => {
  return axios.get(`${API_BASE_URL}${HOMEPAGE_ENDPOINT}`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
};
