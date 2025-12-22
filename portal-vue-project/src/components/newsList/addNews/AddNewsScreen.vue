<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
  <div class="news-create-screen">
    <div class="content-wrapper">
      <h1 class="page-title">お知らせの新規作成</h1>
      <Breadcrumbs :items="breadcrumbs" />

      <AddNewsForm 
        :initial-data="initialNewsData" 
        :is-loading="isLoading"
        @submit-data="handleCreateNews" 
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
import { createNews } from '@/api/newsList'; 
import Layout from '@/components/ui/Layout.vue'

const router = useRouter();
const isLoading = ref(false);

const initialNewsData = {
  title: '',
  content: '',
  // Newsモデルの importance フィールド
  importance: false, 
  // NewsSerializerの attached_file フィールドに対応
  attached_file: null, 
};

const breadcrumbs = computed(() => [
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: '新規作成', path: '/news/create' },
]);

/**
 * フォームデータを受け取り、お知らせ作成APIを呼び出す
 * @param {Object} formData - フォームから emit されたデータ
 */
const handleCreateNews = async (formData) => {
  isLoading.value = true;
  
  try {
    await createNews(formData);

    console.log('お知らせの作成に成功しました。');
    alert('新しいお知らせを作成しました！');
    
    // 成功後、一覧画面に遷移
    router.push('/news'); 

  } catch (error) {
    console.error('お知らせの作成に失敗しました:', error.response || error);
    // エラーメッセージの表示を試みる (例: error.response.data.title など)
    alert('お知らせの作成に失敗しました。\nエラー: ' + (error.response?.data?.detail || 'サーバーエラー'));
  } finally {
    isLoading.value = false;
  }
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