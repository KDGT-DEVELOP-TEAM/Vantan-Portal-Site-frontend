<template>
  <div v-if="newsItem" class="detail-card">
    <div class="header-section">
      <div class="meta-info">
        <span v-if="newsItem.importance" class="important-tag">重要</span>
      </div>
      <h1 class="news-title">{{ newsItem.title }}</h1>
    </div>

    <!-- サムネイル画像 / PDFプレビュー -->
    <div v-if="firstAttachment.type !== 'none'" class="thumbnail-wrapper">
      <img 
        v-if="firstAttachment.type === 'image'" 
        :src="firstAttachment.url" 
        alt="お知らせ画像プレビュー" 
        class="news-thumbnail"
      >
      <PdfThumbnail
        v-else-if="firstAttachment.type === 'pdf'"
        :pdf-url="firstAttachment.url"
        :max-height="400"
        class="news-thumbnail-pdf"
      />
      <div v-else class="no-preview-available">プレビュー利用不可</div>
    </div>

    <!-- 本文 -->
    <div class="content-body" v-html="sanitizedContent"></div>

    <!-- 添付ファイル -->
    <div v-if="allAttachments.length > 0" class="attachment-section">
      <h2>添付ファイル</h2>
      <div class="attachment-grid">
        <div v-for="(attachment, index) in allAttachments" :key="index" class="attachment-item">
          <a :href="attachment.url" target="_blank" class="attachment-link-wrapper">
            <img
              v-if="attachment.type === 'image'"
              :src="attachment.url"
              :alt="`添付画像プレビュー ${index + 1}`"
              class="attachment-thumbnail"
            >
            <PdfThumbnail
              v-else-if="attachment.type === 'pdf'"
              :pdf-url="attachment.url"
              :max-height="150"
              class="attachment-thumbnail pdf-thumbnail-compact"
            />
            <div v-else class="no-preview-available-small">
              <span class="material-symbols-outlined">attachment</span>
              <span>ファイルを開く</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-preview">
    プレビューする内容がありません。
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DOMPurify from 'dompurify';
import PdfThumbnail from '@/components/gallery/PdfThumbnail.vue';

const props = defineProps({
  newsItem: {
    type: Object,
    required: true,
  },
});

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

// v-htmlで表示する前にコンテンツをサニタイズ
const sanitizedContent = computed(() => {
    return props.newsItem.content ? DOMPurify.sanitize(props.newsItem.content) : '';
});

const getAttachmentTypeAndUrl = (attachment) => {
  if (!attachment || !attachment.attached_file_url) {
    return { type: 'none', url: null };
  }
  
  const urlString = attachment.attached_file_url;
  const fileName = (attachment.attached_file_name || urlString).toLowerCase();

  const isBlob = urlString.startsWith('blob:');
  const source = isBlob ? fileName : urlString.split('?')[0].toLowerCase();

  if (IMAGE_EXTENSIONS.some(ext => source.endsWith(ext))) {
    return { type: 'image', url: urlString, name: fileName };
  }
  if (source.endsWith('.pdf')) {
    return { type: 'pdf', url: urlString, name: fileName };
  }
  return { type: 'other', url: urlString, name: fileName };
};

const allAttachments = computed(() => {
  if (props.newsItem && props.newsItem.attachments) {
    return props.newsItem.attachments.map(getAttachmentTypeAndUrl);
  }
  return [];
});

const firstAttachment = computed(() => {
  return allAttachments.value.length > 0 ? allAttachments.value[0] : { type: 'none', url: null };
});

</script>

<style scoped>
/* NewsDetailScreen.vueからスタイルをコピー */
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

.thumbnail-wrapper {
  margin-bottom: 20px;
  text-align: center;
}

.news-thumbnail, .news-thumbnail-pdf {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
.no-preview{
  padding: 3rem;
  text-align: center;
  color: #777;
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
  height: 120px;
  object-fit: cover;
  display: block;
}

.pdf-thumbnail-compact {
  height: 120px;
  object-fit: contain;
  background-color: #e9ecef;
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
