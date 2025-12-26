<template>
  <Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
    <div class="news-screen">
      <div class="content-wrapper">
        <h1 class="page-title">お知らせ</h1>
        <Breadcrumbs :items="breadcrumbs" />
        <NewsListSection :is-admin="isAdmin" />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from '../ui/Layout.vue';
import { ref, computed } from 'vue'; // Import computed
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

const isAdmin = computed(() => props.userRole === 'admin'); // Change ref to computed

// パンくずリストのデータ
const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
]);
</script>

<style scoped>
.news-screen {
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

@media (min-width: 1124px) {
  .news-screen {
    margin-top: 90px;
  }
}
</style>