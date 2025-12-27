<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
  <div class="news-edit-screen">
    <div class="content-wrapper">
      <h1 class="page-title">お知らせの編集</h1>
      <Breadcrumbs :items="breadcrumbs" />
      <EditNewsForm :news-id="newsId" @news-fetched="handleNewsFetched" /> 
    </div>
  </div>
</Layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import Breadcrumbs from '../Breadcrumbs.vue';
import EditNewsForm from './EditNewsForm.vue';
import Layout from '@/components/ui/Layout.vue'
import { useRoute } from 'vue-router';

const route = useRoute();

const newsId = computed(() => route.params.id);
const newsTitle = ref(''); // Add ref for news title

const props = defineProps({
  userRole: {
    type: String,
    required: false,
    default: 'viewer',
  },
});

const handleNewsFetched = (title) => {
  newsTitle.value = title;
};

// パンくずリストのデータ
const breadcrumbs = computed(() => [
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: newsTitle.value || `お知らせID:${newsId.value}`, path: `/news/${newsId.value}` },
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
  color: #F1494C;
  margin-bottom: 5px;
  display: inline-block;
  padding-bottom: 5px;
}

@media (min-width: 1124px) {
  .page-title {
    margin-top: 90px;
  }
}
</style>