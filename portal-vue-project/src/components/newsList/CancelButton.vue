<template>
  <button 
    type="button" 
    class="cancel-button"
    @click="handleCancel"
  >
    <span>キャンセル</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * キャンセル処理を実行し、確認後に /news へ遷移する
 */
const handleCancel = () => {
  // ユーザーに処理の中断を確認
  if (confirm('編集中の内容は保存されません。本当にキャンセルしますか？')) {
    console.log('編集をキャンセルし、/news へ遷移します。');
    
    // お知らせ一覧画面へ遷移
    router.push('/news');
  } else {
    // ユーザーがキャンセルを続行しないことを選択
    console.log('キャンセル処理を中断しました。');
  }
};
</script>

<style scoped>
/* ログインボタンの赤色とは対照的に、キャンセルを示すスタイルを適用します。 */
.cancel-button {
  width: 90px;
  padding: 15px;
  background-color: #f0f0f0; /* 薄い灰色 */
  color: #555;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s, border-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.cancel-button span {
  white-space: nowrap;
}

.cancel-button:hover {
  background-color: #e0e0e0;
  border-color: #999;
}
</style>