// src/api/file.js

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ファイル関連のエンドポイント
export const FILE_ENDPOINT = '/api/files/';

/**
 * URL結合用のヘルパー関数
 */
export const getFileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  
  // 末尾のスラッシュ重複を防ぎつつ結合
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const targetPath = path.startsWith('/') ? path : '/' + path;
  
  return `${base}${targetPath}`;
};