import authApi from '@/plugins/authApi';

/**
 * ギャラリーリストを取得する
 * @returns {Promise<Object>} APIレスポンス
 */
export const getGalleryList = () => {
  return authApi.get('/api/gallery/');
};

/**
 * 特定のギャラリーの詳細を取得する
 * @param {string|number} id - ギャラリーのID
 * @returns {Promise<Object>} APIレスポンス
 */
export const getGalleryDetail = (id) => {
  // 編集コンポーネントの /api/galleries/{id} というパスはタイポの可能性が高い
  // DRFの標準的なルーティング /api/gallery/{id}/ に合わせる
  return authApi.get(`/api/gallery/${id}/`);
};

/**
 * 新しいギャラリーを作成する
 * @param {FormData} formData - ギャラリーのデータ
 * @returns {Promise<Object>} APIレスポンス
 */
export const createGallery = (formData) => {
  return authApi.post('/api/gallery/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ギャラリーを更新する
 * @param {string|number} id - ギャラリーのID
 * @param {FormData} formData - 更新するギャラリーのデータ
 * @returns {Promise<Object>} APIレスポンス
 */
export const updateGallery = (id, formData) => {
  // 編集コンポーネントの /api/galleries/{id} というパスはタイポの可能性が高い
  // DRFの標準的なルーティング /api/gallery/{id}/ に合わせる
  return authApi.patch(`/api/gallery/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ギャラリーを削除する
 * @param {string|number} id - ギャラリーのID
 * @returns {Promise<Object>} APIレスポンス
 */
export const deleteGallery = (id) => {
  return authApi.delete(`/api/gallery/${id}/`);
};

/**
 * ファイルをArrayBufferとして取得する (CORS対策)
 * @param {string} url - ファイルの完全なURL
 * @returns {Promise<Object>} APIレスポンス
 */
export const fetchFile = (url) => {
  return authApi.get(url, { responseType: 'arraybuffer' });
};
