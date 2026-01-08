<template>
  <div v-if="initialLoading" class="loading-message">お知らせ情報を読み込み中...</div>
  <div v-else-if="fetchError" class="error-message">{{ fetchError }}</div>

  <form v-else @submit.prevent="handleSubmit" class="news-form-container">
    <div v-if="submitError" class="error-message">{{ submitError }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    
    <!-- Title -->
    <div class="form-group">
      <label for="title" class="form-label">タイトル <span class="required">(必須)</span></label>
      <input id="title" type="text" v-model="formData.title" class="form-input" required>
      <div v-if="errors.title" class="error-text-inline">{{ errors.title }}</div>
    </div>

    <!-- Content -->
    <div class="form-group">
      <label for="content" class="form-label">内容 <span class="required">(必須)</span></label>
      <textarea id="content" v-model="formData.content" rows="10" class="form-textarea" required></textarea>
      <div v-if="errors.content" class="error-text-inline">{{ errors.content }}</div>
    </div>
    
    <!-- Importance -->
    <div class="form-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="formData.importance"> 
        重要なお知らせとしてマークする
      </label>
    </div>
    
    <!-- File Attachment -->
    <div class="form-group">
      <label for="file" class="form-label">添付ファイル (任意)</label>
      
      <!-- Existing File Preview -->
      <div v-if="existingFileTypeAndUrl.url && !tempAttachmentUrl" class="existing-file-preview">
        <p class="existing-file-label">現在のファイル:</p>
        <div class="thumbnail-container">
          <img v-if="existingFileTypeAndUrl.type === 'image'" :src="existingFileTypeAndUrl.url" alt="現在の添付ファイル" class="thumbnail-image" />
          <PdfThumbnail v-else-if="existingFileTypeAndUrl.type === 'pdf'" :pdf-url="existingFileTypeAndUrl.url" :max-height="100" />
        </div>
      </div>

      <p v-if="!tempAttachmentUrl" class="file-instruction">新しいファイルをアップロードすると、既存の添付ファイルが上書きされます。</p>

      <!-- New File Picker and Preview -->
      <input id="file" type="file" @change="handleFileChange" class="form-input-file" accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp">
      <div v-if="tempAttachmentUrl" class="new-file-preview">
        <p class="new-file-label">選択中の新しいファイル:</p>
        <div class="thumbnail-container">
            <img v-if="formData.attached_file?.type.startsWith('image/')" :src="tempAttachmentUrl" alt="新規ファイルプレビュー" class="thumbnail-image" />
            <PdfThumbnail v-else-if="formData.attached_file?.type === 'application/pdf'" :pdf-url="tempAttachmentUrl" :max-height="100" />
        </div>
      </div>
    </div>

    <div class="button-group">
      <EditNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
      <button type="button" class="action-button preview-button" @click="isPreviewModalVisible = true">プレビュー</button>
      <CancelButton @click="$router.back()" />
    </div>
  </form>

  <!-- プレビュー用モーダル -->
  <NewsPreviewModal :is-open="isPreviewModalVisible" @close="isPreviewModalVisible = false">
    <div class="preview-modal-content">
      <h2 class="preview-title">プレビュー</h2>
      <NewsPreview :news-item="previewNewsItem" />
      <button class="action-button close-preview-button" @click="isPreviewModalVisible = false">閉じる</button>
    </div>
  </NewsPreviewModal>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getNewsDetail, updateNewsWithFeedback } from '@/api/news'; 
import EditNewsSubmitButton from './EditNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';
import NewsPreviewModal from '../NewsPreviewModal.vue';
import NewsPreview from '../NewsPreview.vue';
import PdfThumbnail from '@/components/gallery/PdfThumbnail.vue';

const props = defineProps({
  newsId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const emits = defineEmits(['newsFetched']);

const initialLoading = ref(true);
const fetchError = ref(null);
const isLoading = ref(false);
const submitError = ref(null);
const successMessage = ref(null);
const errors = reactive({});

const originalNewsItem = ref(null);
const isPreviewModalVisible = ref(false);
const tempAttachmentUrl = ref(null);

const formData = reactive({
  title: '',
  content: '',
  importance: false,
  attached_file: null,
});

const handleFileChange = (event) => {
  const file = event.target.files ? event.target.files[0] : null;
  formData.attached_file = file;

  if (tempAttachmentUrl.value) {
    URL.revokeObjectURL(tempAttachmentUrl.value);
    tempAttachmentUrl.value = null;
  }
  if (file) {
    tempAttachmentUrl.value = URL.createObjectURL(file);
  }
};

const handleSubmit = () => {
  updateNewsWithFeedback(props.newsId, formData, router, isLoading, submitError, successMessage, errors);
};

const existingFileTypeAndUrl = computed(() => {
  if (originalNewsItem.value && originalNewsItem.value.attachments && originalNewsItem.value.attachments.length > 0) {
    const url = originalNewsItem.value.attachments[0].attached_file_url;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    if (url.toLowerCase().endsWith('.pdf')) {
      return { type: 'pdf', url };
    }
    if (imageExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
      return { type: 'image', url };
    }
  }
  return { type: 'none', url: null };
});

const previewNewsItem = computed(() => {
  const attachments = [];
  if (tempAttachmentUrl.value) {
    attachments.push({ attached_file_url: tempAttachmentUrl.value, name: formData.attached_file.name });
  } 
  else if (existingFileTypeAndUrl.value.url) {
    attachments.push({ attached_file_url: existingFileTypeAndUrl.value.url });
  }

  return {
    title: formData.title,
    content: formData.content,
    importance: formData.importance,
    created_at: originalNewsItem.value?.created_at || new Date().toISOString(),
    attachments: attachments,
  };
});

onMounted(async () => {
  initialLoading.value = true;
  try {
    const response = await getNewsDetail(props.newsId);
    originalNewsItem.value = response.data;
    
    formData.title = response.data.title;
    formData.content = response.data.content;
    formData.importance = response.data.importance;

    emits('newsFetched', formData.title);
  } catch (err) {
    fetchError.value = '編集のためのお知らせ情報の取得に失敗しました。';
    console.error(err);
  } finally {
    initialLoading.value = false;
  }
});

onUnmounted(() => {
  if (tempAttachmentUrl.value) {
    URL.revokeObjectURL(tempAttachmentUrl.value);
  }
});
</script>

<style scoped>
.news-form-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}
.loading-message, .error-message, .success-message {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}
.loading-message {
  background-color: #f0f0f0;
}
.error-message {
  background-color: #ffe0e0;
  color: #cc0000;
  border: 1px solid #cc0000;
}
.success-message {
  background-color: #e0ffe0;
  color: #008000;
  border: 1px solid #008000;
}
.error-text-inline {
  color: #cc0000;
  font-size: 0.875rem;
  margin-top: 5px;
}
.form-group {
  margin-bottom: 25px;
}
.form-label {
  display: block;
  font-size: 1rem;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}
.form-input, .form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.file-instruction {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 10px;
}
.button-group {
  display: flex; 
  gap: 15px;
  justify-content: flex-end; 
  margin-top: 30px;
}
.action-button {
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
  padding: 10px 20px;
}
.preview-button {
  background-color: #007bff;
  color: white;
}
.preview-button:hover {
  background-color: #0056b3;
}
.preview-modal-content {
  padding: 2rem;
  background: #f9f9f9;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  width: 80vw;
  max-width: 900px;
}
.preview-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
  font-size: 1.5rem;
}
.close-preview-button {
  background-color: #6c757d;
  color: white;
  display: block;
  margin: 20px auto 0;
}
.close-preview-button:hover {
  background-color: #5a6268;
}
.existing-file-preview, .new-file-preview {
  margin-bottom: 10px;
}
.existing-file-label, .new-file-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 5px;
}
.thumbnail-container {
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  overflow: hidden;
}
.thumbnail-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>