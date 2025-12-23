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
 * 新しいお知らせを作成する
 */
export const createNews = (newsData) => {
  const data = new FormData();
  data.append('title', newsData.title);
  data.append('content', newsData.content);
  data.append('importance', newsData.importance); 
  if (newsData.attached_file) {
    data.append('attached_file', newsData.attached_file);
  }

  return axiosInstance.post(NEWS_ENDPOINT, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * お知らせを更新する
 */
export const updateNews = (id, newsData) => {
  const payload = new FormData();
  payload.append('title', newsData.title);
  payload.append('content', newsData.content);
  payload.append('is_important', newsData.is_important);
  payload.append('status', newsData.status);
  payload.append('published_at', newsData.published_at);
  payload.append('related_url', newsData.related_url);

  if (newsData.thumbnail_file instanceof File) {
    payload.append('thumbnail_file', newsData.thumbnail_file);
  } else if (newsData.thumbnail_file === null) {
    payload.append('thumbnail_file_clear', 'true');
  }
  
  if (newsData.sub_thumbnail_file instanceof File) {
    payload.append('sub_thumbnail_file', newsData.sub_thumbnail_file);
  } else if (newsData.sub_thumbnail_file === null) {
    payload.append('sub_thumbnail_file_clear', 'true');
  }

  return axiosInstance.patch(`${NEWS_ENDPOINT}${id}/`, payload, {
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