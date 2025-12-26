<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
  <div class="news-create-screen">
    <div class="content-wrapper">
      <h1 class="page-title">お知らせの新規作成</h1>
      <Breadcrumbs :items="breadcrumbs" />

      <AddNewsForm 
        :initial-data="initialNewsData" 
        :is-loading="isLoading"
        @submit-data="handleCreate" 
      />
    </div>
  </div>
</Layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumbs from '../Breadcrumbs.vue'; 
import AddNewsForm from './AddNewsForm.vue';
import { createNewsWithFeedback } from '@/api/news'; 
import Layout from '@/components/ui/Layout.vue'

const router = useRouter();
const isLoading = ref(false);

const initialNewsData = {
  title: '',
  content: '',
  importance: false, 
  attached_file: null, 
};

const breadcrumbs = computed(() => [
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: '新規作成', path: '/news/create' },
]);

const handleCreate = (formData) => {
  createNewsWithFeedback(formData, isLoading, router);
};
</script>

<style scoped>
.news-create-screen {
  min-height: calc(100vh - 100px);
  background-color: #f7f7f7;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 900px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
</style>