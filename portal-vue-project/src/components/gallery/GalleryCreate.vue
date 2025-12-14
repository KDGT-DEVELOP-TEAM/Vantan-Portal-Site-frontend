<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
  <div class="container gallery-edit-container">
    <h1 class="page-title">ギャラリー新規投稿</h1>
    
    <GalleryForm 
      :is-submitting="isSubmitting" 
      @submit="createGallery" 
      @cancel="$router.back()" 
    />
  </div>
</Layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/plugins/authApi';
import GalleryForm from './GalleryForm.vue'; 
import Layout from '../ui/Layout.vue';

const router = useRouter();
const isSubmitting = ref(false);

// メソッド: 新規作成API
const createGallery = async (formData) => {
  isSubmitting.value = true;
  try {
    // ★ 修正: APIパスを /api/galleries/ に修正
    await authApi.post('/api/gallery/', formData, { 
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    alert('投稿が完了しました！');
    // ★ 修正: 遷移先パスを /galleries に修正
    router.push('/gallery'); 
  } catch (err) {
    console.error('ギャラリー投稿エラー:', err);
    alert('投稿に失敗しました。入力内容を確認してください。');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>

.gallery-edit-container {
  margin: 0 auto;
  margin-top: 90px;
  padding: 1rem;
  max-width: 800px; 
  border-radius: 8px;
}

.page-title {
    text-align: left;
    font-size: 1.5rem; 
    font-weight: bold;
    margin-bottom: 1.5rem; 
    padding-left: 0.75rem; 
    color: #333;
}

</style>