<template>
  <div v-if="initialLoading" class="loading-message">お知らせ情報を読み込み中...</div>
  <div v-else-if="fetchError" class="error-message">{{ fetchError }}</div>

  <form v-else @submit.prevent="handleSubmit" class="news-form-container">
    <button type="button" class="action-button preview-button form-top-right-button" @click="isPreviewModalVisible = true">プレビュー</button>
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
      <label class="form-label">添付ファイル (任意)</label>
      
      <div class="file-upload-area">
        <label class="file-select-button">
          ファイル選択
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp"
            @change="handleFileChange"
            style="display: none;"
          />
        </label>
        <p class="hint">※ 最大{{ MAX_FILES }}件まで添付可能</p>
        <p v-if="attachmentError" class="error-message">{{ attachmentError }}</p>
      </div>
      
      <div class="file-thumbnail-container" v-if="formData.attachments.length > 0">
        <div v-for="(file, index) in formData.attachments" :key="getFileIdentifier(file)" class="thumbnail-item">
          <div class="thumbnail-preview" :title="getFileName(file)">
            <template v-if="isImage(file)">
              <img :src="getFileUrl(file)" :alt="getFileName(file)" class="thumbnail-image">
            </template>
            <template v-else>
              <PdfThumbnail v-if="getFileUrl(file)" :pdf-url="getFileUrl(file)" :max-height="120" />
              <div v-else class="file-icon">{{ getFileExtension(file) }}</div>
            </template>
          </div>
          <button type="button" @click="removeFile(index)" class="remove-file-button" title="このファイルを削除">&times;</button>
        </div>
      </div>

    </div>

    <div class="button-group">
      <EditNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
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
import { getNewsDetail, updateNews } from '@/api/news'; 
import EditNewsSubmitButton from './EditNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';
import NewsPreviewModal from '../NewsPreviewModal.vue';
import NewsPreview from '../NewsPreview.vue';
import PdfThumbnail from '../PdfThumbnail.vue';

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
const errors = reactive({
  title: '',
  content: '',
});

const isPreviewModalVisible = ref(false);

// 定数
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const attachmentError = ref(null);


const form = reactive({
  title: '',
  content: '',
  importance: false,
});

/** 既存添付ファイル（API由来） */
const existingAttachments = ref([]);

/** 新規添付ファイル（Fileのみ） */
const newAttachments = ref([]);

/** プレビューURL管理 */
const previewUrls = ref(new Map());

/** 削除対象ID */
const deletedAttachmentIds = ref([]);

// ヘルパー関数: ファイルが画像か判定
const isImage = (fileName) => {
  return /\.(jpg|jpeg|png|gif|svg|bmp)$/i.test(fileName);
};

// ヘルパー関数: ファイルの拡張子を取得
const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toUpperCase();
};

/** 新規ファイル追加 */
const handleFileChange = (event) => {
  attachmentError.value = null;
  const selectedFiles = Array.from(event.target.files);

  // 合計ファイル数のチェック
  const totalFiles = existingAttachments.value.length + newAttachments.value.length + selectedFiles.length;
  if (totalFiles > MAX_FILES) {
    attachmentError.value = `添付ファイルは最大${MAX_FILES}件までです。`;
    event.target.value = '';
    return;
  }

  // サイズチェック
  for (const file of selectedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      attachmentError.value = `${file.name} のサイズが大きすぎます（最大${MAX_FILE_SIZE / (1024 * 1024)}MB）。`;
      event.target.value = '';
      return;
    }
  }

  // ファイル追加とプレビューURL作成
  selectedFiles.forEach(file => {
    newAttachments.value.push(file);
    previewUrls.value.set(file, URL.createObjectURL(file));
  });

  event.target.value = '';
};

/** 既存ファイル削除 */
const removeExistingFile = (file) => {
  deletedAttachmentIds.value.push(file.id);
  existingAttachments.value = existingAttachments.value.filter(f => f.id !== file.id);
};

/** 新規ファイル削除 */
const removeNewFile = (file) => {
  const url = previewUrls.value.get(file);
  if (url) {
    URL.revokeObjectURL(url);
    previewUrls.value.delete(file);
  }
  newAttachments.value = newAttachments.value.filter(f => f !== file);
};


const handleSubmit = async () => {
  submitError.value = null;
  successMessage.value = null;
  Object.keys(errors).forEach(key => errors[key] = '');

  // Frontend validation
  let isValid = true;
  if (!formData.value.title) {
    errors.title = 'タイトルは必須です。';
    isValid = false;
  }
  if (!formData.value.content) {
    errors.content = '本文は必須です。';
    isValid = false;
  }

  if (!isValid) {
    submitError.value = '入力内容にエラーがあります。確認してください。';
    return;
  }

  isLoading.value = true;

  const submitFormData = new FormData();
  submitFormData.append('title', formData.title);
  submitFormData.append('content', formData.content);
  submitFormData.append('importance', formData.importance);

  newAttachments.value.forEach(file => {
    submitFormData.append("attachement_files", file);
  })

  deletedAttachmentIds.value.forEach(id => {
    submitFormData.append('delete_file_ids', id);
  });

  try {
    await updateNews(props.newsId, submitFormData);
    successMessage.value = 'お知らせが正常に更新されました。';
    // Optionally, redirect after a short delay
    setTimeout(() => router.push(`/news/${props.newsId}`), 1000);
  } catch (err) {
    console.error('お知らせ更新エラー:', err);
    if (err.response && err.response.status === 400 && err.response.data) {
        submitError.value = '入力内容を修正してください。';
        for (const key in err.response.data) {
            if (errors.hasOwnProperty(key)) {
                errors[key] = err.response.data[key].join(' ');
            }
        }
    } else {
        submitError.value = `お知らせの更新に失敗しました。: ${err.response?.data?.detail || 'サーバーエラーを確認してください。'}`;
    }
  } finally {
    isLoading.value = false;
  }
};


const previewNewsItem = computed(() => {
  const previewAttachments = [];
  
  // 既存ファイル
  existingAttachments.value.forEach(file => {
    previewAttachments.push({
      attached_file_url: file.attached_file_url,
      attached_file_name: file.attached_file_name,
    });
  });

  // 新規ファイル
  newAttachments.value.forEach(file => {
    const url = previewUrls.value.get(file);
    if (url) {
      previewAttachments.push({
        attached_file_url: url,
        attached_file_name: file.name,
      });
    }
  });

  return {
    title: form.value.title,
    content: form.value.content,
    importance: form.value.importance,
    attachments: previewAttachments,
  };
});

onMounted(async () => {
  initialLoading.value = true;
  try {
    const response = await getNewsDetail(props.newsId);
    
    form.value.title = response.data.title;
    form.value.content = response.data.content;
    form.value.importance = response.data.importance;

    if (response.data.attachments) {
      existingAttachments.value = [...response.data.attachments];
    }

    emits('newsFetched', form.value.title);
  } catch (err) {
    fetchError.value = '編集のためのお知らせ情報の取得に失敗しました。';
    console.error(err);
  } finally {
    initialLoading.value = false;
  }
});

onUnmounted(() => {
  // プレビューURLを全てクリーンアップ
  previewUrls.value.forEach(url => {
    URL.revokeObjectURL(url);
  });
  previewUrls.value.clear();
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
  position: relative; /* プレビューボタンを絶対配置するための基準 */
}

/* プレビューボタンを右上に配置 */
.form-top-right-button {
  position: absolute;
  top: 10px; /* news-form-container の padding-top に合わせる */
  right: 30px; /* news-form-container の padding-right に合わせる */
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
.button-group {
  display: flex; 
  gap: 15px;
  justify-content: flex-end; 
  margin-top: 30px;
}
.action-button {
  display: inline-flex; /* SubmitButton に合わせる */
  align-items: center; /* SubmitButton に合わせる */
  justify-content: center; /* SubmitButton に合わせる */
  border: none;
  border-radius: 6px; /* 統一感を出すために SubmitButton に合わせる */
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s; /* SubmitButton に合わせる */
  font-size: 1rem; /* 統一感を出すために SubmitButton に合わせる */
  padding: 12px 25px; /* 統一感を出すために SubmitButton に合わせる */
  min-width: 150px; /* 統一感を出すために SubmitButton に合わせる */
  font-weight: bold; /* SubmitButton に合わせる */
}
.preview-button {
  background-color: #007bff; /* 青色 */
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
  /* display: block; */ /* action-button で inline-flex になるため不要 */
  margin: 20px auto 0;
}
.close-preview-button:hover {
  background-color: #5a6268;
}

.hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
}

.error-message {
  color: #f15b5b;
  font-size: 0.9rem;
  margin-top: 5px;
}

.file-thumbnail-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.thumbnail-item {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  overflow: hidden;
  /* 縦横比を1:1に保つ */
  aspect-ratio: 1 / 1;
}

.thumbnail-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 1.5rem;
  font-weight: bold;
  color: #777;
}

.remove-file-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  transition: background-color 0.2s;
}

.remove-file-button:hover {
  background-color: rgba(209, 61, 61, 0.9);
}
</style>