<template>
  <div class="news-screen">
    <div class="content-wrapper">
      <h1 class="page-title">お知らせ</h1>
      
      <!-- パンくずリスト -->
      <Breadcrumbs :items="breadcrumbs" />

      <!-- お知らせ一覧セクション -->
      <NewsListSection :is-admin="isAdmin" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Breadcrumbs from './Breadcrumbs.vue';
import NewsListSection from './NewsListSection.vue';

// props (親コンポーネントからユーザー権限を受け取る想定)
const props = defineProps({
  // 'admin' or 'viewer'
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const isAdmin = ref(props.userRole === 'admin');

// パンくずリストのデータ
const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
]);
</script>

<style scoped>
.news-screen {
  min-height: calc(100vh - 100px); /* フッターなどを考慮した最小の高さ */
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