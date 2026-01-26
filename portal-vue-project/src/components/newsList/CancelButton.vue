<template>
  <button 
    type="button" 
    class="action-button cancel-button"
    @click="handleCancel"
  >
    <span>{{ t('common.cancel') }}</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const handleCancel = () => {
  if (confirm(t('news.confirm.cancel'))) {
    router.push('/news');
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
