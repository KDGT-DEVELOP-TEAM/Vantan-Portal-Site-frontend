import authApi from '@/plugins/authApi';

/**
 * お知らせリストを取得する
 * @returns {Promise<Object>} APIレスポンス
 */
export const getNewsList = () => {
  return authApi.get('/api/news/');
};

/**
 * 特定のお知らせの詳細を取得する
 * @param {string|number} id - お知らせのID
 * @returns {Promise<Object>} APIレスポンス
 */
export const getNewsDetail = (id) => {
  return authApi.get(`/api/news/${id}/`);
};

/**
 * 新しいお知らせを作成する
 * @param {Object} newsData - お知らせのデータ
 * @returns {Promise<Object>} APIレスポンス
 */
export const createNews = (newsData) => {
  const data = new FormData();
  data.append('title', newsData.title);
  data.append('content', newsData.content);
  data.append('importance', newsData.importance); 
  if (newsData.attached_file) {
    data.append('attached_file', newsData.attached_file);
  }

  return authApi.post('/api/news/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * お知らせを更新する
 * @param {string|number} id - お知らせのID
 * @param {Object} newsData - 更新するお知らせのデータ
 * @returns {Promise<Object>} APIレスポンス
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

  return authApi.patch(`/api/news/${id}/`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * お知らせを削除する
 * @param {string|number} id - お知らせのID
 * @returns {Promise<Object>} APIレスポンス
 */
export const deleteNews = (id) => {
  return authApi.delete(`/api/news/${id}/`);
};
