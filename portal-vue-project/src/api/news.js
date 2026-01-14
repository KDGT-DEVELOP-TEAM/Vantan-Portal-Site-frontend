// src/api/news.js
import axiosInstance from './axiosInstance';

const NEWS_ENDPOINT = '/api/news/';

/**
 * お知らせリストを取得する
 */
export const getNewsList = () => {
  return axiosInstance.get(NEWS_ENDPOINT);
};

/**
 * 特定のお知らせの詳細を取得する
 */
export const getNewsDetail = (id) => {
  return axiosInstance.get(`${NEWS_ENDPOINT}${id}/`);
};

/**
 * ファイルのバイナリデータを取得する
 * @param {string} url - ファイルのURL
 */
export const fetchFile = (url) => {
  return axiosInstance.get(url, { responseType: 'arraybuffer' });
};

/**
 * 新しいお知らせを作成する
 * @param {FormData} formData - { title, content, importance, attachment_files? }
 */
export const createNews = (formData) => {
  return axiosInstance.post(NEWS_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * お知らせを更新する
 * @param {string|number} id - News ID
 * @param {FormData} formData - { title, content, importance, attachment_files?, delete_file_ids? }
 */
export const updateNews = (id, formData) => {
  return axiosInstance.patch(`${NEWS_ENDPOINT}${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * お知らせを削除する
 */
export const deleteNews = (id) => {
  return axiosInstance.delete(`${NEWS_ENDPOINT}${id}/`);
};
