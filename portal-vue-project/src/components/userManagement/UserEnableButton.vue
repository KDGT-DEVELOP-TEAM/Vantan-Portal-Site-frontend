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
  import { userApi } from '@/api/userManagementApi';
  
  // propsの定義
  const props = defineProps({
    user: {
      type: Object,
      required: true
    },
    isCurrentUserAdmin: {
      type: Boolean,
      required: true,
    },
  });
  
  // emitsの定義
  const emit = defineEmits(['updated']);
  
  const isLoading = ref(false);

  /**
   * ユーザーのis_activeステータスを切り替えるAPIを呼び出す
   */
   const toggleActiveStatus = async () => {
      if (isLoading.value || !props.isCurrentUserAdmin) return;

      const newStatus = !props.user.is_active;
      isLoading.value = true;

      try {
        await userApi.update(props.user.id, { is_active: newStatus });
        emit('updated', newStatus);
      } catch (err) {
        emit('error', `ステータス変更に失敗しました: ${err.response?.data?.detail || err.message}`);
      } finally {
        isLoading.value = false;
      }
    };
  </script>
  
  <style scoped>
  .action-button {
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: bold;
    transition: background-color 0.3s;
    white-space: nowrap;
    min-width: 70px;
  }
  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .enable {
    /* 画像に合わせてグリーン系に調整 */
    background-color: #5cb85c; 
    color: white;
  }
  .enable:hover {
    background-color: white; 
    box-shadow: 0 0 0 2px #5cb85c inset;
    color: #5cb85c;
  }
  .disable {
    /* ★画像に合わせてグレー系に調整 */
    background-color: #aaa; 
    color: white;
  }
  .disable:hover {
    background-color: white; 
    box-shadow: 0 0 0 2px #aaa inset;
    color: #aaa;
  }
  </style>