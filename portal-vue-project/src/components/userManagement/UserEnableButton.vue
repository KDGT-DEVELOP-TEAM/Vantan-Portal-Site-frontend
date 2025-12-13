<template>
    <button 
      @click="toggleActiveStatus" 
      :disabled="isLoading || !isCurrentUserAdmin"
      :class="['action-button', user.is_active ? 'disable' : 'enable']"
    >
      {{ isLoading ? '処理中...' : (user.is_active ? '無効化' : '有効化') }}
    </button>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  // propsの定義
  const props = defineProps({
    user: {
      type: Object,
      required: true
    },
    isCurrentUserAdmin: {
      type: Boolean,
      required: true,
    }
  });
  
  // emitsの定義
  const emit = defineEmits(['updated']);
  
  const isLoading = ref(false);
  
  // ★追加: APIのベースURLを定義
  const API_BASE_URL = 'http://127.0.0.1:8085';

  /**
   * ユーザーのis_activeステータスを切り替えるAPIを呼び出す
   */
  const toggleActiveStatus = async () => {
    // 自身のアカウントは操作できないようにするなどの追加ロジックも必要に応じて実装してください
    if (isLoading.value || !props.isCurrentUserAdmin) return;
    
    // ユーザー自身を操作しようとしていないかチェック
    // 実際のアプリケーションでは、ログインユーザーIDをpropsやストアから取得して比較します
    // if (props.user.id === CURRENT_USER_ID) {
    //   alert('自身のアカウントの有効/無効は変更できません。');
    //   return;
    // }

    const newStatus = !props.user.is_active;
    isLoading.value = true;
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('認証トークンが見つかりません。');
      isLoading.value = false;
      return;
    }
  
    try {
      // ★修正: 絶対パスを使用し、APIコール時の診断を容易にする
      const url = `${API_BASE_URL}/api/users/${props.user.id}/set_active_status/`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });
  
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `ステータス変更エラー: ${response.status} - URL: ${url}`);
      }
  
      // 成功したら親コンポーネントに通知してデータを再取得させる
      emit('updated', newStatus); 
    } catch (err) {
      console.error('ステータス変更失敗:', err);
      alert(`ステータス変更に失敗しました: ${err.message}`);
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .action-button {
    padding: 6px 10px; /* ★デザイン調整 */
    border: none;
    border-radius: 5px; /* ★デザイン調整 */
    cursor: pointer;
    font-size: 0.85rem; /* ★デザイン調整 */
    font-weight: bold;
    transition: background-color 0.3s;
    white-space: nowrap;
    min-width: 70px; /* ★デザイン調整 */
  }
  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .enable {
    /* ★画像に合わせてグリーン系に調整 */
    background-color: #5cb85c; 
    color: white;
  }
  .enable:hover {
    background-color: white; 
    box-shadow: 0 0 0 2px #5cb85c inset; /* 内側グリーンの枠線 */
    color: #5cb85c;
  }
  .disable {
    /* ★画像に合わせてグレー系に調整 */
    background-color: #aaa; 
    color: white;
  }
  .disable:hover {
    background-color: white; 
    box-shadow: 0 0 0 2px #aaa inset; /* 内側グリーンの枠線 */
    color: #aaa;
  }
  </style>