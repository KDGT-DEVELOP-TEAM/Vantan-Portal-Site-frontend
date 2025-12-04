<template>
  <div class="news-edit-screen">
    <div class="content-wrapper">
      <h1 class="page-title">お知らせの編集 (ID: {{ newsId }})</h1>
      
      <!-- パンくずリスト -->
      <Breadcrumbs :items="breadcrumbs" />

      <!-- フォーム本体 -->
      <!-- newsIdは実際にはURLパラメータから取得するが、ここではpropsとしてMock -->
      <EditNewsForm :news-id="newsId" /> 
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Breadcrumbs from '../Breadcrumbs.vue';
import EditNewsForm from './EditNewsForm.vue';
import EditCancelButton from '../CancelButton.vue';
// import { useRoute } from 'vue-router'; // 実際にはVue Routerを使用

// const route = useRoute();
// const newsId = route.params.id;

// MockとしてIDを固定
const newsId = ref(1); 

// パンくずリストのデータ
const breadcrumbs = computed(() => [
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: `お知らせID:${newsId.value}`, path: `/news/${newsId.value}` },
  { label: '編集', path: `/news/${newsId.value}/edit` },
]);
</script>

<style scoped>
.news-edit-screen {
  min-height: calc(100vh - 100px);
  background-color: #f7f7f7;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  border-bottom: 3px solid #1e90ff; /* 編集画面は青 */
  display: inline-block;
  padding-bottom: 5px;
}
</style>