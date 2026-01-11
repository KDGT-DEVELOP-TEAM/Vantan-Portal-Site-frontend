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
 * @param {object} newsData - { title, content, importance, attached_file? }
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
 * @param {number} id - News ID
 * @param {object} newsData - { title, content, importance, attached_file? }
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

/**
 * お知らせリストを取得し、コンポーネントの状態を更新する
 * @param {ref} newsList - お知らせデータを格納するref
 */
export const fetchNewsListWithState = async (newsList) => {
  try {
    const response = await getNewsList();
    newsList.value = response.data;
    console.log('お知らせリストをAPIから取得しました。');
  } catch (error) {
    console.error('お知らせリストの取得に失敗しました:', error.response || error);
  }
};

/**
 * お知らせを削除し、フィードバックとリストの再取得を行う
 * @param {number} id - お知らせID
 * @param {ref} newsList - お知らせリストのref
 */
export const deleteNewsWithFeedback = async (id, newsList) => {
  if (!confirm('このお知らせを削除しますか？')) {
    return;
  }
  try {
    await deleteNews(id);
    console.log(`お知らせID ${id} の削除に成功しました。`);
    // 成功後、リストを再取得して画面を更新
    await fetchNewsListWithState(newsList);
  } catch (error) {
    console.error(`お知らせID ${id} の削除に失敗しました:`, error.response || error);
  }
};

/**
 * お知らせ編集用に詳細データを取得し、コンポーネントの状態を更新する
 */
export const fetchNewsForEdit = async (id, initialLoading, fetchError, formData, existingFileName) => {
  initialLoading.value = true;
  fetchError.value = null;
  try {
    const response = await getNewsDetail(id);
    const data = response.data;

    formData.title = data.title;
    formData.content = data.content;
    formData.importance = data.importance;

    if (data.attachments && data.attachments.length > 0) {
      const url = data.attachments[0].attached_file_url;
      const decodedFileName = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
      existingFileName.value = decodedFileName;
    }
  } catch (err) {
    console.error('お知らせデータ取得エラー:', err);
    fetchError.value = '編集のためのお知らせ情報の取得に失敗しました。';
  } finally {
    initialLoading.value = false;
  }
};

/**
 * お知らせを更新し、フィードバックとリダイレクトを行う
 */
export const updateNewsWithFeedback = async (id, formData, router, isLoading, submitError, successMessage, errors) => {
  submitError.value = null;
  successMessage.value = null;

  Object.keys(errors).forEach(key => errors[key] = '');
  let isValid = true;
  if (!formData.title) {
    errors.title = 'タイトルは必須です。';
    isValid = false;
  }
  if (!formData.content) {
    errors.content = '本文は必須です。';
    isValid = false;
  }

  if (!isValid) {
    submitError.value = '入力内容にエラーがあります。確認してください。';
    return;
  }

  isLoading.value = true;
  try {
    await updateNews(id, formData);
    successMessage.value = 'お知らせが正常に更新されました。';
    router.push(`/news/${id}`);
  } catch (err) {
    console.error('お知らせ更新エラー:', err);
    if (err.response && err.response.status === 400 && err.response.data) {
        submitError.value = '入力内容を修正してください。';
        Object.keys(errors).forEach(key => errors[key] = '');
        for (const key in err.response.data) {
            if (formData.hasOwnProperty(key)) {
                errors[key] = err.response.data[key][0];
            }
        }
    } else {
        submitError.value = `お知らせの更新に失敗しました。: ${err.response?.data?.detail || 'サーバーエラーを確認してください。'}`;
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * お知らせを新規作成し、フィードバックとリダイレクトを行う
 * @param {object} formData - フォームデータ
 * @param {ref} isLoading - 送信状態のref
 * @param {object} router - Vue Routerのインスタンス
 */
export const createNewsWithFeedback = async (formData, isLoading, router) => {
  isLoading.value = true;
  try {
    await createNews(formData);
    console.log('お知らせの作成に成功しました。');
    router.push('/news');
  } catch (error) {
    console.error('お知らせの作成に失敗しました:', error.response || error);
  } finally {
    isLoading.value = false;
  }
};