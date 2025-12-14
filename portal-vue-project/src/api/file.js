// src/api/file.js

// 共通のベースURL (環境変数 process.env.VUE_APP_API_BASE_URL などに置き換えるとなお良いです)
export const API_BASE_URL = 'http://127.0.0.1:8085';

// ファイル関連のエンドポイント
export const FILE_ENDPOINT = '/api/file/';

/**
 * URL結合用のヘルパー関数（オプション）
 * ベースURLとパスを安全に結合します
 */
export const getFileUrl = (path) => {
  if (!path) return '';
  // 既に絶対URLの場合はそのまま返す
  if (/^https?:\/\//.test(path)) return path;
  
  // ベースURLと結合して返す
  return new URL(path, API_BASE_URL).href;
};