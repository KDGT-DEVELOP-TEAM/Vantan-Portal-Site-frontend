// src/plugins/authApi.js

import axios from 'axios';

// App.vueやLoginForm.vueで統一した正しいベースURLを使用
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// 共通設定を持つ認証済みAxiosインスタンスを作成
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターを設定
// すべてのリクエストが送信される直前に実行され、トークンをヘッダーに追加します
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // 401エラーで、かつリフレッシュ処理をまだ試していない場合
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // リトライフラグを立てる
      
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // 新しいアクセストークンを要求
          const response = await axios.post(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
            refresh: refreshToken,
          });

          const { access: newAccessToken } = response.data;
          
          // 新しいトークンをローカルストレージに保存
          localStorage.setItem('accessToken', newAccessToken);

          // 元のリクエストのヘッダーを新しいトークンで更新
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 元のリクエストを再実行
          return authApi(originalRequest);
          
        } catch (refreshError) {
          // リフレッシュAPI自体が失敗した場合（リフレッシュトークンも期限切れ）
          console.error('トークンリフレッシュに失敗しました。ログインが必要です。', refreshError);
          // ログアウト処理を実行（App.vueのhandleLogoutをトリガーするのが理想）
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userRole');
          // ログイン画面へリダイレクト
          window.location.href = '/login'; 
          
          return Promise.reject(refreshError);
        }
      }
    }

    // それ以外のエラー（リフレッシュ失敗、CORS、404など）はそのまま返す
    return Promise.reject(error);
  }
);

export default authApi;