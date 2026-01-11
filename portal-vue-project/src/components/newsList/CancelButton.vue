<template>
  <button 
    type="button" 
    class="action-button cancel-button"
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
  background-color: #6c757d; /* 灰色 */
  color: white; /* テキスト色を白に統一 */
  border: none; /* action-button で border は除去されるが、念のため */
  margin-top: 30px;
}

.cancel-button:hover {
  background-color: #5a6268;
  /* border-color: #999; */ /* 不要だが、元のスタイルに合わせる */
}

.cancel-button span {
  white-space: nowrap;
}
</style>