<template>
  <div class="news-detail-screen">
    <Layout :user-role="userRole" current-page="お知らせ詳細" @logout="handleLogout">
      <div class="content-wrapper">
        <Breadcrumbs :items="breadcrumbs" />

        <div v-if="loading" class="loading-message">お知らせを読み込み中...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        
        <div v-else-if="newsItem" class="detail-card">
          <div class="header-section">
            <div class="meta-info">
              <span class="date">{{ new Date(newsItem.created_at).toLocaleDateString() }}</span>
              <span v-if="newsItem.importance" class="important-tag">重要</span>
            </div>
            <h1 class="news-title">{{ newsItem.title }}</h1>
          </div>

          <!-- サムネイル画像 / PDFプレビュー -->
          <div v-if="mainAttachmentPreview.type !== 'none'" class="thumbnail-wrapper">
            <img 
              v-if="mainAttachmentPreview.type === 'image'" 
              :src="mainAttachmentPreview.url" 
              alt="お知らせ画像" 
              class="news-thumbnail"
            >
            <PdfThumbnail
              v-else-if="mainAttachmentPreview.type === 'pdf'"
              :pdf-url="mainAttachmentPreview.url"
              :max-height="400"
              class="news-thumbnail-pdf"
            />
            <div v-else class="no-preview-available">プレビュー利用不可</div>
          </div>

          <!-- 本文 -->
          <div class="content-body" v-html="newsItem.content"></div>

          <!-- 添付ファイル -->
          <div v-if="newsItem.attachments && newsItem.attachments.length > 0" class="attachment-section">
            <h2>添付ファイル</h2>
            <div class="attachment-grid">
              <div v-for="(attachment, index) in newsItem.attachments" :key="attachment.id" class="attachment-item">
                <a :href="attachment.attached_file_url" target="_blank" class="attachment-link-wrapper">
                  <img
                    v-if="getAttachmentTypeAndUrl(attachment.attached_file_url).type === 'image'"
                    :src="getAttachmentTypeAndUrl(attachment.attached_file_url).url"
                    :alt="`添付画像 ${index + 1}`"
                    class="attachment-thumbnail"
                  >
                  <PdfThumbnail
                    v-else-if="getAttachmentTypeAndUrl(attachment.attached_file_url).type === 'pdf'"
                    :pdf-url="getAttachmentTypeAndUrl(attachment.attached_file_url).url"
                    :max-height="150"
                    class="attachment-thumbnail pdf-thumbnail-compact"
                  />
                  <div v-else class="no-preview-available-small">
                    <span class="material-symbols-outlined">attachment</span>
                    <span>ファイル{{ index + 1 }}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <!-- 管理者アクションボタン -->
          <div v-if="isAdmin" class="admin-actions">
            <button class="action-button edit-button" @click="goToEdit(newsItem.id)">
              <span class="material-symbols-outlined">edit</span> 編集
            </button>
            <button class="action-button delete-button" @click="handleDelete(newsItem.id)">
              <span class="material-symbols-outlined">delete</span> 削除
            </button>
          </div>
        </div>
        
        <div class="back-link-wrapper">
          <router-link to="/news" class="back-to-list">
            <span class="material-symbols-outlined">chevron_left</span> お知らせ一覧へ戻る
          </router-link>
        </div>
      </div>
    </Layout>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Breadcrumbs from './Breadcrumbs.vue';
import { getNewsDetail, deleteNews } from '@/api/news';
import Layout from '@/components/ui/Layout.vue';
import PdfThumbnail from '@/components/gallery/PdfThumbnail.vue'; // Import PdfThumbnail

const route = useRoute();
const router = useRouter();

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const newsItem = ref(null);
const loading = ref(true);
const error = ref(null);
const isAdmin = computed(() => props.userRole === 'admin');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getAttachmentTypeAndUrl = (urlString) => {
  if (!urlString) {
    return { type: 'none', url: null };
  }
  try {
    const url = new URL(urlString);
    const pathname = url.pathname.toLowerCase();
    
    if (IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
      return { type: 'image', url: urlString };
    }
    if (pathname.endsWith('.pdf')) {
      return { type: 'pdf', url: urlString };
    }
  } catch (e) {
    // Handle cases where urlString is just a path (e.g., /media/...)
    const pathname = urlString.split('?')[0].toLowerCase();
    if (IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
      return { type: 'image', url: urlString };
    }
    if (pathname.endsWith('.pdf')) {
      return { type: 'pdf', url: urlString };
    }
  }
  return { type: 'none', url: null };
};

const mainAttachmentPreview = computed(() => {
  if (newsItem.value && newsItem.value.attachments && newsItem.value.attachments.length > 0) {
    return getAttachmentTypeAndUrl(newsItem.value.attachments[0].attached_file_url);
  }
  return { type: 'none', url: null };
});

const breadcrumbs = computed(() => [
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: newsItem.value ? newsItem.value.title : '詳細', path: `/news/${route.params.id}` },
]);

const fetchNewsDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const newsId = route.params.id;
    const response = await getNewsDetail(newsId);
    newsItem.value = response.data;
  } catch (err) {
    console.error('お知らせ詳細の取得に失敗:', err);
    error.value = 'お知らせ情報の取得に失敗しました。';
  } finally {
    loading.value = false;
  }
};

const goToEdit = (id) => {
  router.push(`/news/${id}/edit`);
};

const handleDelete = async (id) => {
  if (confirm('このお知らせを本当に削除しますか？')) {
    try {
      await deleteNews(id);
      alert('お知らせを削除しました。');
      router.push('/news');
    } catch (err) {
      console.error('お知らせの削除に失敗:', err);
      alert('お知らせの削除に失敗しました。');
    }
  }
};

const handleLogout = () => {
  console.log("logout requested from detail screen");
};

onMounted(() => {
  fetchNewsDetail();
});
</script>

<style scoped>
.news-detail-screen {
  min-height: calc(100vh - 100px);
  background-color: #f7f7f7;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 900px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
  margin-top: 60px;
}

@media (min-width: 1124px) {
  .content-wrapper {
    margin-top: 100px;
  }
}

.detail-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-top: 20px;
}

.header-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 10px;
}

.date {
  font-weight: bold;
}

.important-tag {
  background-color: #f15b5b;
  color: white;
  padding: 4px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.news-title {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

/* Thumbnail specific styles */
.thumbnail-wrapper {
  margin-bottom: 20px;
  text-align: center;
}

.news-thumbnail {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.news-thumbnail-pdf {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0; /* Add a background for PDF viewer */
}

.no-preview-available {
  padding: 50px;
  text-align: center;
  color: #777;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-size: 1.1rem;
}

.content-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 30px;
}

.attachment-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.attachment-section h2 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 10px;
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #1e90ff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s;
}

.attachment-link:hover {
  color: #007bff;
  text-decoration: underline;
}

.attachment-link .material-symbols-outlined {
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

.back-to-list .material-symbols-outlined {
  font-size: 20px;
}

.loading-message, .error-message {
  text-align: center;
  padding: 50px;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 10px;
  color: #333;
}
.error-message {
  color: #cc0000;
  border: 1px solid #cc0000;
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
  background-color: #7FB922;
  color: #f0f8ff;
  border-color: #7FB922;
}

.delete-button {
  background-color: #F1494C;
  color: #ffe0e0;
  border-color: #F1494C;
}

.action-button .material-symbols-outlined {
  font-size: 18px;
}

/* New styles for attachment thumbnails */
.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.attachment-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;
}

.attachment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.attachment-link-wrapper {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.attachment-thumbnail {
  width: 100%;
  height: 120px; /* Fixed height for consistency */
  object-fit: cover; /* Cover the area */
  display: block;
}

.pdf-thumbnail-compact {
  height: 120px; /* Fixed height for consistency */
  object-fit: contain;
  background-color: #e9ecef; /* Lighter background for PDF */
}

.no-preview-available-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background-color: #f8f9fa;
  color: #6c757d;
  font-size: 0.9rem;
  padding: 10px;
  text-align: center;
}

.no-preview-available-small .material-symbols-outlined {
  font-size: 36px;
  margin-bottom: 5px;
  color: #adb5bd;
}
</style>