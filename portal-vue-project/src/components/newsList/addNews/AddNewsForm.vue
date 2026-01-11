<template>
  <div class="news-form-card">
    <button type="button" class="action-button preview-button form-top-right-button" @click="isPreviewModalVisible = true">プレビュー</button>

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
        <label>添付ファイル (任意)</label>
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
      </div>
      
      <div class="form-group inline-label-group" v-if="formData.attachments.length > 0">
        <label></label>
        <ul class="file-list">
          <li v-for="(file, index) in formData.attachments" :key="getFileIdentifier(file)">
            {{ getFileName(file) }} ({{ getFileSize(file) }})
            <button type="button" @click="removeFile(index)" class="remove-file-button">削除</button>
          </li>
        </ul>
      </div>

      <div class="button-group">
        <AddNewsSubmitButton :is-loading="isLoading" submit-label="追加" />
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

// 定数
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const attachmentError = ref(null);

const formData = reactive({
  title: props.initialData.title ?? '',
  content: props.initialData.content ?? '',
  importance: props.initialData.importance ?? false,
  attachments: props.initialData.attachments ? [...props.initialData.attachments] : [], // 既存の添付ファイルを初期値として設定
});
const isPreviewModalVisible = ref(false);
const deletedAttachmentIds = ref([]); // 削除された既存ファイルのIDを保持

// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトからファイル名を取得
const getFileName = (file) => {
  return file.name || file.attached_file_name || '不明なファイル'; // 'attached_file_name'は仮。APIレスポンスの構造に合わせる
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
  } else if (file.attached_file_size) { // 既存の添付ファイルの場合 (仮)
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


const handleFileChange = (event) => {
  attachmentError.value = null; // エラーメッセージをリセット
  const selectedFiles = Array.from(event.target.files);

  // 既に formData.attachments に含まれている File オブジェクトの URL をrevoke
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

  // サイズチェックと重複チェック（既存ファイル名との重複も考慮する必要があるが、一旦は新規選択ファイル内でのチェック）
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
  // ここでは、新規ファイルは常に上書きされることを前提とする（もしユーザーが複数のinput要素を使い分ける場合は異なるロジックが必要）
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
    alert('見出し(タイトル)と本文は必須項目です。');
    return;
  }
  const submitFormData = new FormData();
  submitFormData.append('title', formData.title);
  submitFormData.append('content', formData.content);
  submitFormData.append('importance', formData.importance);

  // 新規追加された File オブジェクトのみを 'attachment_files' として追加
  formData.attachments.forEach((file) => {
    if (file instanceof File) {
      submitFormData.append('attachment_files', file); // ここを 'attachment_files' に変更
    }
  });

  // 削除された既存の添付ファイルのIDを 'delete_file_ids' として追加
  deletedAttachmentIds.value.forEach(id => {
    submitFormData.append('delete_file_ids', id);
  });
  
  emit('submit-data', submitFormData);
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
        attached_file_name: file.attached_file_name || file.name, // APIレスポンスにファイル名が含まれる場合
      });
    }
  });

  return {
    title: formData.title,
    content: formData.content,
    importance: formData.importance,
    created_at: new Date().toISOString(), // プレビュー用なので仮
    attachments: previewAttachments,
  };
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
.news-form-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-top: 20px;
  position: relative; /* プレビューボタンを絶対配置するための基準 */
}

/* プレビューボタンを右上に配置 */
.form-top-right-button {
  position: absolute;
  top: 30px; /* news-form-card の padding-top に合わせる */
  right: 30px; /* news-form-card の padding-right に合わせる */
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

/* プレビューボタン */
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
  background-color: #6c757d; /* 灰色 */
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

.file-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  max-height: 150px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.file-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
}

.file-list li:last-child {
  border-bottom: none;
}

.remove-file-button {
  background-color: #f15b5b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.remove-file-button:hover {
  background-color: #d13d3d;
}
</style>