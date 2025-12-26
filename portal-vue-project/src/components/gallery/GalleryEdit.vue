<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
  <div class="container gallery-edit-container">
    <h1 class="page-title">ギャラリー編集</h1>
    
    <div v-if="loading" class="loading-message">読み込み中...</div>
    
    <GalleryForm 
      v-else-if="galleryData"
      :initial-data="galleryData"
      :existing-images="existingImages"
      :is-edit="true"
      :is-submitting="isSubmitting"
      @submit="handleUpdate" 
      @cancel="$router.back()"
      @delete-image="handleDeleteImage"
    />
  </div>
</Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchGalleryForEdit, updateGalleryWithFeedback } from '@/api/gallery';
import Layout from '../ui/Layout.vue';
import GalleryForm from './GalleryForm.vue'; 

const route = useRoute();
const router = useRouter();

const galleryData = ref(null);
const existingImages = ref([]);
const imagesToDelete = ref([]);
const loading = ref(true);
const isSubmitting = ref(false);

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const handleDeleteImage = (imageId) => {
  if (!imagesToDelete.value.includes(imageId)) {
    imagesToDelete.value.push(imageId);
  }
  // Remove from the display
  existingImages.value = existingImages.value.filter(img => img.id !== imageId);
};

const handleUpdate = (formData) => {
  const payload = {
    ...formData,
    delete_file_ids: imagesToDelete.value,
  };
  updateGalleryWithFeedback(route.params.id, payload, isSubmitting, router);
};

onMounted(() => {
  fetchGalleryForEdit(route.params.id, loading, galleryData, existingImages, router);
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