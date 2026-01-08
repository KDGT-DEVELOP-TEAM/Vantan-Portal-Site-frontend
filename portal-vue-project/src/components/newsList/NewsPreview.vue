<template>
  <div v-if="newsItem" class="detail-card">
    <div class="header-section">
      <div class="meta-info">
        <!-- プレビューでは現在の日付を表示 -->
        <span class="date">{{ new Date().toLocaleDateString() }}</span>
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
    <div v-if="firstAttachment.url" class="attachment-section">
      <h2>添付ファイル</h2>
      <a :href="firstAttachment.url" target="_blank" class="attachment-link">
        ファイルを開く (プレビュー) <span class="material-symbols-outlined">open_in_new</span>
      </a>
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

const firstAttachment = computed(() => {
  if (props.newsItem && props.newsItem.attachments && props.newsItem.attachments.length > 0) {
    const attachment = props.newsItem.attachments[0];
    if (!attachment || !attachment.attached_file_url) {
      return { type: 'none', url: null };
    }
    const urlString = attachment.attached_file_url;
    const pathname = urlString.split('?')[0].toLowerCase();
    
    if (IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
      return { type: 'image', url: urlString };
    }
    if (pathname.endsWith('.pdf')) {
      return { type: 'pdf', url: urlString };
    }
  }
  return { type: 'none', url: null };
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
</style>
