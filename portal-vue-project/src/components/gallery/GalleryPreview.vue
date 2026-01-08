<template>
  <div v-if="galleryItem" class="gallery-content-card">
    <div class="gallery-header">
      <div class="header-text">
        <h1 class="gallery-title">{{ galleryItem.title }}</h1>
      </div>
    </div>

    <div class="gallery-body-content">
      {{ galleryItem.content }}
    </div>

    <!-- プレビューでは画像一覧のみ表示 -->
    <div v-if="galleryItem.images && galleryItem.images.length > 0" class="gallery-image-section">
      <h3 class="image-section-title">添付ファイル</h3>
      <div class="image-grid">
        <div v-for="(file, index) in galleryItem.images" :key="index" class="image-item">
          <template v-if="getFileTypeAndUrl(file).type === 'image'">
            <img :src="getFileTypeAndUrl(file).url" :alt="galleryItem.title" class="gallery-image" />
          </template>
          <template v-else-if="getFileTypeAndUrl(file).type === 'pdf'">
            <PdfThumbnail
              :pdf-url="getFileTypeAndUrl(file).url"
              :max-height="150"
              class="gallery-image"
            />
          </template>
          <div v-else class="gallery-no-image-placeholder">プレビュー利用不可</div>
        </div>
      </div>
    </div>
      <p class="gallery-date">
          作成日: {{ new Date().toLocaleDateString('ja-JP') }}
      </p>
  </div>
  <div v-else class="no-preview">
    プレビューする内容がありません。
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PdfThumbnail from './PdfThumbnail.vue';

const props = defineProps({
  galleryItem: {
    type: Object,
    required: true,
  },
});

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getFileTypeAndUrl = (file) => {
  // file_urlは既存の画像、urlは新規追加の画像(createObjectURL)を想定
  const fileUrl = file.file_url || file.url; 
  if (!fileUrl) {
    return { type: 'none', url: null };
  }

  // createObjectURLで生成されたblob URLも考慮
  if (fileUrl.startsWith('blob:')) {
     if (file.type && file.type.startsWith('image/')) {
        return { type: 'image', url: fileUrl };
     }
     if (file.type && file.type === 'application/pdf') {
        return { type: 'pdf', url: fileUrl };
     }
  }

  const urlLower = fileUrl.toLowerCase();
  if (urlLower.endsWith('.pdf')) {
    return { type: 'pdf', url: fileUrl };
  }
  if (IMAGE_EXTENSIONS.some(ext => urlLower.endsWith(ext))) {
    return { type: 'image', url: fileUrl };
  }
  return { type: 'none', url: null };
};

</script>

<style scoped>
/* GalleryDetail.vueからスタイルをコピー */
.gallery-content-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    padding-bottom: 70px; 
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
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    color: #888;
    font-size: 0.9rem;
    margin-top: 5px;
}
.gallery-body-content {
    white-space: pre-wrap;
    line-height: 1.8;
    color: #444;
    margin-bottom: 30px;
}
.gallery-image-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px dashed #ccc;
}
.image-section-title {
    font-size: 1.2rem;
    color: #F1494C;
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
}
.gallery-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
}
.gallery-no-image-placeholder{
    width: 100%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    background-color: #f9fafb;
}
.no-preview{
  padding: 3rem;
  text-align: center;
  color: #777;
}
</style>