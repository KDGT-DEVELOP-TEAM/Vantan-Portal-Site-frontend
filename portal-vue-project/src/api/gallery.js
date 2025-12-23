// src/api/gallery.js
import axiosInstance from './axiosInstance';

const GALLERY_ENDPOINT = '/api/gallery/';

/**
 * ギャラリーリストを取得する
 */
export const getGalleryList = () => {
  return axiosInstance.get(GALLERY_ENDPOINT);
};

/**
 * 特定のギャラリーの詳細を取得する
 */
export const getGalleryDetail = (id) => {
  return axiosInstance.get(`${GALLERY_ENDPOINT}${id}/`);
};

/**
 * 新しいギャラリーを作成する
 */
export const createGallery = (formData) => {
  return axiosInstance.post(GALLERY_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ギャラリーを更新する
 */
export const updateGallery = (id, formData) => {
  return axiosInstance.patch(`${GALLERY_ENDPOINT}${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ギャラリーを削除する
 */
export const deleteGallery = (id) => {
  return axiosInstance.delete(`${GALLERY_ENDPOINT}${id}/`);
};

/**
 * ファイルをArrayBufferとして取得する (CORS対策)
 */
export const fetchFile = (url) => {
  return axiosInstance.get(url, { responseType: 'arraybuffer' });
};