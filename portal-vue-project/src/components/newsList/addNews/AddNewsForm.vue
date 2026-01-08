<template>
  <div class="news-form-card">
    <form @submit.prevent="handleSubmit">
      
      <div class="form-group inline-label-group">
        <label for="title">見出し (タイトル) <span class="required">(必須)</span></label>
        <input id="title" type="text" v-model="formData.title" required placeholder="タイトルを入力してください">
      </div>

      <div class="form-group inline-label-group">
        <label for="content">内容 <span class="required">(必須)</span></label>
        <textarea id="content" v-model="formData.content" rows="8" placeholder="内容を入力してください"></textarea>
      </div>
      
      <div class="form-group inline-label-group">
        <label></label> <div class="input-area">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.importance"> 
            重要なお知らせ (任意)
          </label>
        </div>
      </div>

      <div class="form-group inline-label-group">
        <label for="file">添付ファイル (任意)</label>
        <div class="file-upload-area">
          <input 
            id="file" 
            type="file" 
            @change="handleFileChange" 
            accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp"
            style="display: none;"
          >
          <label for="file" class="file-select-button">ファイル選択</label>
          <span class="file-name">{{ formData.attached_file ? formData.attached_file.name : 'ファイルが選択されていません' }}</span>
        </div>
      </div>

      <div class="button-group">
        <AddNewsSubmitButton :is-loading="isLoading" submit-label="追加" />
        <button type="button" class="action-button preview-button" @click="isPreviewModalVisible = true">プレビュー</button>
        <CancelButton />
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
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted } from 'vue';
import AddNewsSubmitButton from './AddNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';
import NewsPreviewModal from '../NewsPreviewModal.vue';
import NewsPreview from '../NewsPreview.vue';

const props = defineProps({
  initialData: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit-data']);

const formData = reactive({ ...props.initialData });
const isPreviewModalVisible = ref(false);

const tempAttachmentUrl = ref(null);

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
  if (!formData.title || !formData.content) {
    alert('見出し(タイトル)と本文は必須項目です。');
    return;
  }
  emit('submit-data', formData);
};

const previewNewsItem = computed(() => {
  const attachments = [];
  if (tempAttachmentUrl.value) {
    attachments.push({
      attached_file_url: tempAttachmentUrl.value,
    });
  }

  return {
    title: formData.title,
    content: formData.content,
    importance: formData.importance,
    created_at: new Date().toISOString(),
    attachments: attachments,
  };
});

onUnmounted(() => {
  if (tempAttachmentUrl.value) {
    URL.revokeObjectURL(tempAttachmentUrl.value);
  }
});
</script>

<style scoped>
.news-form-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.inline-label-group {
  display: flex;
  margin-bottom: 25px;
}

.inline-label-group label {
  flex-basis: 150px; 
  min-width: 150px;
  text-align: right;
  padding-right: 20px;
  font-weight: bold;
  color: #333;
}

.inline-label-group .input-area,
.inline-label-group input[type="text"], 
.inline-label-group textarea {
  flex-grow: 1;
  width: auto;
}

.form-group input[type="text"], 
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.required {
  color: #f15b5b;
  margin-left: 4px;
  font-size: 0.8rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  color: #333;
}

.file-upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-select-button {
  display: inline-block;
  padding: 8px 15px;
  background-color: #fff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-select-button:hover {
  background-color: #f0f0f0;
}

.file-name {
  font-size: 0.9rem;
  color: #777;
}

.button-group {
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  padding-top: 30px;
  margin-left: 170px;
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
</style>