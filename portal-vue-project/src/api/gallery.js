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
 * @param {object} galleryData - { title, content, image_files: [...] }
 */
export const createGallery = (galleryData) => {
  const formData = new FormData();
  formData.append('title', galleryData.title);
  formData.append('content', galleryData.content);

  if (galleryData.image_files && galleryData.image_files.length > 0) {
    galleryData.image_files.forEach(file => {
      formData.append('image_files', file);
    });
  }

  return axiosInstance.post(GALLERY_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ギャラリーを更新する
 * @param {number} id - Gallery ID
 * @param {object} galleryData - { title, content, image_files?: [...], delete_file_ids?: [...] }
 */
export const updateGallery = (id, galleryData) => {
  const formData = new FormData();
  formData.append('title', galleryData.title);
  formData.append('content', galleryData.content);

  // new image files の追加
  if (galleryData.image_files && galleryData.image_files.length > 0) {
    galleryData.image_files.forEach(file => {
      formData.append('image_files', file);
    });
  }

  // 削除するために IDs of images を追加
  if (galleryData.delete_file_ids && galleryData.delete_file_ids.length > 0) {
    galleryData.delete_file_ids.forEach(fileId => {
      formData.append('delete_file_ids', fileId);
    });
  }

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

/**
 * ギャラリーリストを取得し、コンポーネントの状態を更新する
 * @param {ref} loading - ローディング状態のref
 * @param {ref} error - エラー状態のref
 * @param {ref} allGalleries - ギャラリーデータを格納するref
 */
export const fetchGalleries = async (loading, error, allGalleries) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGalleryList(); // 既存の低レベルAPI関数を呼び出し
    allGalleries.value = response.data;
  } catch (err) {
    console.error('ギャラリーリストの取得に失敗しました:', err);
    error.value = 'ギャラリー情報の取得に失敗しました。';
  } finally {
    loading.value = false;
  }
};

/**
 * ギャラリー詳細を取得し、コンポーネントの状態を更新する
 * @param {string|number} id - ギャラリーID
 * @param {ref} loading - ローディング状態のref
 * @param {ref} error - エラー状態のref
 * @param {ref} gallery - ギャラリーデータを格納するref
 * @param {ref} breadcrumbs - パンくずリストのref
 */
export const fetchGalleryDetailWithState = async (id, loading, error, gallery) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getGalleryDetail(id);
    gallery.value = response.data;
    if (!gallery.value) {
      error.value = 'ギャラリーが見つかりませんでした。';
    }
  } catch (err) {
    console.error('ギャラリー詳細の取得に失敗しました:', err);
    error.value = err.response?.data?.detail || '情報の取得中にエラーが発生しました。';
  } finally {
    loading.value = false;
  }
};

/**
 * ギャラリーを削除し、フィードバックとリダイレクトを行う
 * @param {object} gallery - ギャラリーオブジェクト
 * @param {object} router - Vue Routerのインスタンス
 */
export const deleteGalleryWithFeedback = async (gallery, router) => {
  if (!gallery || !window.confirm('本当にこのギャラリーを削除しますか？')) {
    return;
  }
  try {
    await deleteGallery(gallery.id); // 既存の低レベルAPI関数を呼び出し
    router.push('/gallery');
  } catch (err) {
    console.error('ギャラリー削除に失敗しました:', err);
  }
};

/**
 * ギャラリー編集用に詳細データを取得し、コンポーネントの状態を更新する
 * @param {string|number} id - ギャラリーID
 * @param {ref} loading - ローディング状態のref
 * @param {ref} galleryData - フォームデータを格納するref
 * @param {ref} existingImages - 既存の画像リストを格納するref
 * @param {object} router - Vue Routerのインスタンス
 */
export const fetchGalleryForEdit = async (id, loading, galleryData, existingImages, router) => {
  loading.value = true;
  try {
    const response = await getGalleryDetail(id);
    galleryData.value = response.data;
    existingImages.value = response.data.images || [];
  } catch (err) {
    console.error('ギャラリーデータの読み込みに失敗しました:', err);
    router.push('/gallery');
  } finally {
    loading.value = false;
  }
};

/**
 * ギャラリーを更新し、フィードバックとリダイレクトを行う
 * @param {string|number} id - ギャラリーID
 * @param {object} payload - 送信するデータ
 * @param {ref} isSubmitting - 送信状態のref
 * @param {object} router - Vue Routerのインスタンス
 */
export const updateGalleryWithFeedback = async (id, payload, isSubmitting, router) => {
  isSubmitting.value = true;
  try {
    await updateGallery(id, payload);
    router.push(`/gallery/${id}`);
  } catch (err) {
    console.error('ギャラリー更新に失敗しました:', err);
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * ギャラリーを新規作成し、フィードバックとリダイレクトを行う
 * @param {object} formData - フォームデータ
 * @param {ref} isSubmitting - 送信状態のref
 * @param {object} router - Vue Routerのインスタンス
 */
export const createGalleryWithFeedback = async (formData, isSubmitting, router) => {
  isSubmitting.value = true;
  try {
    await createGallery(formData);
    router.push('/gallery');
  } catch (err) {
    console.error('ギャラリー投稿エラー:', err);
  } finally {
    isSubmitting.value = false;
  }
};



