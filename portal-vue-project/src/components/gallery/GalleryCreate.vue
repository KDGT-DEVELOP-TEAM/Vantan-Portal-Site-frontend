<template>
  <Layout :user-role="userRole" :current-page="$t('page.home')" @logout="$emit('logout')">
    <div class="container gallery-edit-container">
      <h1 class="page-title">{{ $t('gallery.create.title') }}</h1>

      <GalleryForm
        :is-submitting="isSubmitting"
        @submit="handleCreate"
        @cancel="$router.back()"
      />
    </div>
  </Layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createGalleryWithFeedback } from '@/api/gallery';
import GalleryForm from './GalleryForm.vue'; 
import Layout from '../ui/Layout.vue';

const router = useRouter();
const isSubmitting = ref(false);

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const handleCreate = (formData) => {
  createGalleryWithFeedback(formData, isSubmitting, router);
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
