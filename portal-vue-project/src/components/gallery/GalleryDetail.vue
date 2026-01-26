<template>
  <Layout :user-role="userRole" :current-page="$t('page.home')" @logout="$emit('logout')">
    <Breadcrumbs :items="breadcrumbs" class="bread-crumbs" />

    <div class="gallery-detail-container">
      <div v-if="loading" class="status-message loading-state">
        {{ $t('common.loading') }}
      </div>

      <div v-else-if="gallery" class="gallery-content-card">
        <div class="gallery-header">
          <div class="header-text">
            <h1 class="gallery-title">{{ gallery.title }}</h1>
          </div>
        </div>

        <div class="gallery-body-content">
          {{ gallery.content }}
        </div>

        <!-- メインプレビュー（サムネ相当） -->
        <div class="gallery-thumbnail-preview">
          <template v-if="thumbnail.type === 'image'">
            <img
              :src="thumbnail.url"
              :alt="gallery.title"
              class="gallery-main-thumbnail"
            />
          </template>

          <template v-else-if="thumbnail.type === 'pdf'">
            <PdfThumbnail
              :pdf-url="thumbnail.url"
              :max-height="400"
              class="gallery-main-thumbnail"
              style="width: 100%; height: auto; max-height: 400px;"
            />
          </template>

          <div v-else class="gallery-no-image">
            {{ $t('common.noImage') }}
          </div>
        </div>

        <!-- 添付一覧 -->
        <div
          v-if="gallery.images && gallery.images.length > 0"
          class="gallery-image-section"
        >
          <h3 class="image-section-title">{{ $t('gallery.attachments') }}</h3>

          <div class="image-grid">
           <div v-for="f in attachmentPreviews" :key="f.id" class="image-item">
              <img v-if="f.type === 'image'" :src="f.url" :alt="gallery.title" class="gallery-image" />
              <PdfThumbnail v-else-if="f.type === 'pdf'" :pdf-url="f.url" :max-height="150" class="gallery-image" />
              <div v-else class="gallery-no-image-placeholder">{{ $t('common.noPreview') }}</div>
            </div>
          </div>
        </div>

        <p class="gallery-date">
          {{ $t('common.createdAt') }}: {{ formattedCreatedAt }}
        </p>

        <div v-if="userRole === 'admin'" class="admin-actions">
          <button
            type="button"
            @click="$router.push(`/gallery/${gallery.id}/edit`)"
            class="action-button edit-button"
          >
            <span class="material-symbols-outlined">edit</span>
            {{ $t('gallery.edit') }}
          </button>

          <button
            type="button"
            @click="handleDelete"
            class="action-button delete-button"
          >
            <span class="material-symbols-outlined">delete</span>
            {{ $t('gallery.delete') }}
          </button>
        </div>
      </div>

      <div v-else-if="error" class="status-message error-state">
        {{ error }}
      </div>

      <div class="back-link-wrapper">
        <router-link to="/gallery" class="back-to-list">
          <span class="material-symbols-outlined">chevron_left</span>
          {{ $t('gallery.backToList') }}
        </router-link>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import {
  fetchGalleryDetailWithState,
  deleteGalleryWithFeedback
} from '@/api/gallery';

import Layout from '../ui/Layout.vue';
import Breadcrumbs from './Breadcrumbs.vue';
import PdfThumbnail from './PdfThumbnail.vue';

defineProps({
  userRole: {
    type: String,
    default: 'viewer', // 'admin' or 'viewer'
  },
});

const { t, locale } = useI18n();

const route = useRoute();
const router = useRouter();

const gallery = ref(null);
const loading = ref(true);
const error = ref(null);

const breadcrumbs = computed(() => [
  { label: t('page.home'), path: '/home' },
  { label: t('breadcrumb.gallery'), path: '/gallery' },
  { label: gallery.value ? gallery.value.title : t('breadcrumb.detail'), path: route.path },
]);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getFileTypeAndUrl = (file) => {
  const fileUrl = file?.file_url || file?.attached_file;
  if (!fileUrl) return { type: 'none', url: null };

  const urlLower = String(fileUrl).toLowerCase();

  if (urlLower.endsWith('.pdf')) return { type: 'pdf', url: fileUrl };
  if (IMAGE_EXTENSIONS.some((ext) => urlLower.endsWith(ext))) {
    return { type: 'image', url: fileUrl };
  }
  return { type: 'none', url: null };
};


// 添付一覧のプレビュー（computedで整形）
const attachmentPreviews = computed(() => {
  const files = gallery.value?.images ?? [];
  return files.map((f) => {
    const { type, url } = getFileTypeAndUrl(f);
    return { id: f.id, type, url };
  });
});

const getThumbnailUrl = (galleryItem) => {
  if (!galleryItem) return { type: 'none', url: null };

  // 1) 明示サムネ（将来用）
  if (galleryItem.thumbnail_url && galleryItem.thumbnail_url.length > 0) {
    return { type: 'image', url: galleryItem.thumbnail_url };
  }

  // 2) 添付の先頭をサムネとして使う
  const first = galleryItem.images?.[0];
  if (first) {
    return getFileTypeAndUrl(first);
  }

  return { type: 'none', url: null };
};

const thumbnail = computed(() => getThumbnailUrl(gallery.value));


// i18nのlocaleに追従して日付表記を変更
const formattedCreatedAt = computed(() => {
  const raw = gallery.value?.created_at;
  if (!raw) return '';

  const localeMap = {
    ja: 'ja-JP',
    en: 'en-US',
  };
  const dateLocale = localeMap[locale.value] ?? 'ja-JP';

  return new Date(raw).toLocaleDateString(dateLocale);
});

// 削除処理（ガード付き）
const handleDelete = () => {
  if (!gallery.value) return;
  deleteGalleryWithFeedback(gallery.value, router);
};

onMounted(() => {
  const id = route.params.id;
  fetchGalleryDetailWithState(id, loading, error, gallery);
});
</script>

<style scoped>
.bread-crumbs {
  margin-top: 120px;
}

.gallery-detail-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.status-message {
  padding: 20px;
  text-align: center;
  color: #555;
  margin-top: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.error-state {
  color: #ef4444;
}

.gallery-content-card {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.header-text {
  flex-grow: 1;
}

.gallery-title {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.gallery-date {
  color: #888;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: block;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.gallery-body-content {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #444;
  margin-bottom: 30px;
}

.gallery-thumbnail-preview {
  margin-top: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
}

.gallery-main-thumbnail {
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  border-radius: 8px;
}

.gallery-no-image {
  padding: 50px;
  color: #9ca3af;
  font-weight: bold;
  background-color: #f9fafb;
  width: 100%;
  text-align: center;
  border-radius: 8px;
}

.gallery-image-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #ccc;
}

.image-section-title {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 15px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.image-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-no-image-placeholder {
  font-size: 0.9rem;
  color: #777;
}

.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.edit-button {
  background-color: #7fb922;
  color: #f0f8ff;
  border-color: #7fb922;
}

.edit-button:hover {
  background-color: #69a31a;
}

.delete-button {
  background-color: #f1494c;
  color: white;
  border-color: #f1494c;
}

.delete-button:hover {
  background-color: #d94043;
}

.action-button .material-symbols-outlined {
  font-size: 18px;
}

.back-link-wrapper {
  text-align: center;
  margin-top: 30px;
}

.back-to-list {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #f15b5b;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  padding: 10px 20px;
  border: 1px solid #f15b5b;
  border-radius: 5px;
  transition: background-color 0.2s, color 0.2s;
}

.back-to-list:hover {
  background-color: #f15b5b;
  color: white;
}
</style>
