<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
  <div class="container gallery-edit-container">
    <h1 class="page-title">ギャラリー編集</h1>
    
    <div v-if="loading" class="loading-message">読み込み中...</div>
    
    <GalleryForm 
      v-else
      :initial-data="galleryData" 
      :is-edit="true"
      :is-submitting="isSubmitting"
      @submit="updateGallery" 
      @cancel="$router.back()" 
    />
  </div>
</Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getGalleryDetail, updateGallery as apiUpdateGallery } from '@/api/gallery';
import Layout from '../ui/Layout.vue';
import GalleryForm from './GalleryForm.vue'; 

const route = useRoute();
const router = useRouter();

const galleryData = ref(null);
const loading = ref(false);
const isSubmitting = ref(false);

/**
 * メソッド: 既存データ取得
 */
const fetchGalleryData = async () => {
  loading.value = true;
  try {
    const response = await getGalleryDetail(route.params.id);
    galleryData.value = response.data;
  } catch (err) {
    console.error('ギャラリーデータの読み込みに失敗しました:', err);
    alert('データの読み込みに失敗しました。一覧に戻ります。');
    router.push('/gallery');
  } finally {
    loading.value = false;
  }
};

/**
 * メソッド: 更新API (PATCH)
 */
const updateGallery = async (formData) => {
  isSubmitting.value = true;
  try {
    await apiUpdateGallery(route.params.id, formData);
    
    alert('ギャラリーを更新しました！');
    // 詳細画面へ遷移 (パスも /galleries/{id} に修正)
    router.push(`/galleries/${route.params.id}`);
  } catch (err) {
    console.error('ギャラリー更新に失敗しました:', err);
    alert(`更新に失敗しました: ${err.response?.data?.detail || '不明なエラー'}`);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchGalleryData();
});
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

.loading-message {
  text-align: center;
  padding: 2.5rem 0;
  font-size: 1.1rem;
  color: #555;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

</style>