<template>
  <div class="news-create-screen">
    <div class="content-wrapper">
      <h1 class="page-title">お知らせの新規投稿</h1>
      
      <!-- パンくずリスト -->
      <Breadcrumbs :items="breadcrumbs" />

      <!-- フォーム本体 -->
      <AddNewsForm />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Breadcrumbs from '../Breadcrumbs.vue';
import AddNewsForm from './AddNewsForm.vue';

// パンくずリストのデータ
const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: '新規投稿', path: '/news/create' },
]);
</script>

<style scoped>
.news-create-screen {
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
  border-bottom: 3px solid #f15b5b;
  display: inline-block;
  padding-bottom: 5px;
}
</style>