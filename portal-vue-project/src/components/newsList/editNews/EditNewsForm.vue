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
import { getNewsDetail, updateNewsWithFeedback } from '@/api/news'; 
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
const errors = reactive({});

const originalNewsItem = ref(null);
const isPreviewModalVisible = ref(false);
const deletedAttachmentIds = ref([]); // 削除された既存ファイルのIDを保持

// 定数
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const attachmentError = ref(null);


const formData = reactive({
  title: '',
  content: '',
  importance: false,
  attachments: [],
});


// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトからファイル名を取得
const getFileName = (file) => {
  return file.name || file.attached_file_name || '不明なファイル';
};

// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトからファイルサイズを取得
const getFileSize = (file) => {
  if (file.size) { // File オブジェクトの場合
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = file.size;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  } else if (file.attached_file_size) { // 既存の添付ファイルの場合
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = file.attached_file_size;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  }
  return 'N/A';
};

// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトの一意な識別子を生成
const getFileIdentifier = (file) => {
  return file.id || `${file.name}-${file.size}-${file.lastModified}`;
};

// ヘルパー関数: ファイルが画像か判定
const isImage = (file) => {
  const fileName = getFileName(file).toLowerCase();
  return /\.(jpg|jpeg|png|gif|svg|bmp)$/.test(fileName);
};

// ヘルパー関数: ファイルのプレビューURLを取得
const getFileUrl = (file) => {
  if (file instanceof File) {
    return file._url; // 新規追加されたファイルのローカルURL
  }
  return file.attached_file_url; // 既存のファイルのURL
};

// ヘルパー関数: ファイルの拡張子を取得
const getFileExtension = (file) => {
  const fileName = getFileName(file);
  return fileName.split('.').pop().toUpperCase();
};


const handleFileChange = (event) => {
  attachmentError.value = null; // エラーメッセージをリセット
  const selectedFiles = Array.from(event.target.files);

  // 既に formData.attachments に含まれている File オブジェクトの URL をrevoke
  // ここでは新しいFileオブジェクトだけを対象とする
  formData.attachments.forEach(file => {
    if (file instanceof File && file._url) {
      URL.revokeObjectURL(file._url);
    }
  });

  // 既存のファイル（DBに保存済みのもの）の数と今回選択されたファイルの合計数をチェック
  const existingFilesCount = formData.attachments.filter(f => f.id).length; // idがあれば既存ファイルとみなす
  const currentNewFilesCount = formData.attachments.filter(f => !f.id).length; // idがなければ新規ファイルとみなす

  // 新規選択ファイルのみの配列
  const newSelectedFiles = [];

  // サイズチェックと重複チェック
  for (const file of selectedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      attachmentError.value = `${file.name} のサイズが大きすぎます（最大${MAX_FILE_SIZE / (1024 * 1024)}MB）。`;
      event.target.value = ''; // 同じファイルを再選択できるようにリセット
      return;
    }
    newSelectedFiles.push(file);
  }

  // 合計ファイル数のチェック
  if (existingFilesCount + currentNewFilesCount + newSelectedFiles.length > MAX_FILES) {
    attachmentError.value = `添付ファイルは最大${MAX_FILES}件までです。`;
    event.target.value = '';
    return;
  }
  
  // 新規追加されたファイルの URL を作成し、File オブジェクトに保存しておく
  newSelectedFiles.forEach(file => {
    file._url = URL.createObjectURL(file); // プレビュー用に一時URLを保存
  });

  // formData.attachments に新規選択ファイルを追加 (既存の新規ファイルは上書き)
  // シンプルに、以前に選択された新規ファイルは削除し、今回選択された新規ファイルに置き換える
  formData.attachments = [
    ...formData.attachments.filter(f => f.id), // 既存ファイルは残す
    ...newSelectedFiles, // 新規選択ファイルを追加
  ];
  
  // 同じファイルを再選択できるようにリセット
  event.target.value = '';
};

const removeFile = (index) => {
  const fileToRemove = formData.attachments[index];
  if (fileToRemove.id) { // 既存の添付ファイルの場合
    deletedAttachmentIds.value.push(fileToRemove.id);
  }
  if (fileToRemove instanceof File && fileToRemove._url) {
    URL.revokeObjectURL(fileToRemove._url); // 一時URLを解放
  }
  formData.attachments.splice(index, 1);
};


const handleSubmit = () => {
  if (!formData.title || !formData.content) {
    alert('タイトルと内容を入力してください。');
    return;
  }

  const submitFormData = new FormData();
  submitFormData.append('title', formData.title);
  submitFormData.append('content', formData.content);
  submitFormData.append('importance', formData.importance);

  // 新規追加された File オブジェクトのみを 'attachment_files' として追加
  formData.attachments.forEach((file) => {
    if (file instanceof File) {
      submitFormData.append('attachment_files', file);
    }
  });

  // 削除された既存の添付ファイルのIDを 'delete_file_ids' として追加
  deletedAttachmentIds.value.forEach(id => {
    submitFormData.append('delete_file_ids', id);
  });

  updateNewsWithFeedback(props.newsId, submitFormData, router, isLoading, submitError, successMessage, errors);
};


const previewNewsItem = computed(() => {
  const previewAttachments = [];
  formData.attachments.forEach(file => {
    if (file instanceof File && file._url) {
      previewAttachments.push({
        attached_file_url: file._url, // File オブジェクトの一時URL
        attached_file_name: file.name,
      });
    } else if (file.attached_file_url) {
      previewAttachments.push({
        attached_file_url: file.attached_file_url, // 既存の添付ファイルのURL
        attached_file_name: file.attached_file_name || file.name,
      });
    }
  });

  return {
    title: formData.title,
    content: formData.content,
    importance: formData.importance,
    attachments: previewAttachments,
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
    // 既存の添付ファイルを formData.attachments にセット
    if (response.data.attachments) {
      formData.attachments = [...response.data.attachments];
    }

    emits('newsFetched', formData.title);
  } catch (err) {
    fetchError.value = '編集のためのお知らせ情報の取得に失敗しました。';
    console.error(err);
  } finally {
    initialLoading.value = false;
  }
});

onUnmounted(() => {
  // アンマウント時に一時URLを解放
  formData.attachments.forEach(file => {
    if (file instanceof File && file._url) {
      URL.revokeObjectURL(file._url);
    }
  });
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