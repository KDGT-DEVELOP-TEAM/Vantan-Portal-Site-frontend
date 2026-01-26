<template>
  <div class="news-form-card">
    <button
      type="button"
      class="action-button preview-button form-top-right-button"
      @click="isPreviewModalVisible = true"
    >
      {{ $t('common.preview') }}
    </button>

    <form @submit.prevent="handleSubmit">
      <div class="form-group inline-label-group">
        <label for="title">
          {{ $t('news.addForm.headline') }}
          <span class="required">{{ $t('common.required') }}</span>
        </label>
        <input
          id="title"
          type="text"
          v-model="formData.title"
          required
          :placeholder="$t('news.addForm.titlePlaceholder')"
        />
      </div>

      <div class="form-group inline-label-group">
        <label for="content">
          {{ $t('news.addForm.content') }}
          <span class="required">{{ $t('common.required') }}</span>
        </label>
        <textarea
          id="content"
          v-model="formData.content"
          rows="8"
          :placeholder="$t('news.addForm.contentPlaceholder')"
        ></textarea>
      </div>

      <div class="form-group inline-label-group">
        <label></label>
        <div class="input-area">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.importance" />
            {{ $t('news.addForm.important') }} {{ $t('common.optional') }}
          </label>
        </div>
      </div>

      <div class="form-group inline-label-group">
        <label>
          {{ $t('news.addForm.attachments') }} {{ $t('common.optional') }}
        </label>

        <div class="file-upload-area">
          <label class="file-select-button">
            {{ $t('news.addForm.chooseFile') }}
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp"
              @change="handleFileChange"
              style="display: none;"
            />
          </label>

          <p class="hint">
            {{ $t('news.addForm.maxFilesHint', { max: MAX_FILES }) }}
          </p>

          <p v-if="attachmentError" class="error-message">{{ attachmentError }}</p>
        </div>
      </div>

      <div class="form-group inline-label-group" v-if="attachments.length > 0">
        <label></label>
        <ul class="file-list">
          <li v-for="(file, index) in attachments" :key="getFileIdentifier(file)">
            {{ getFileName(file) }} ({{ getFileSize(file) }})
            <button type="button" @click="removeFile(index)" class="remove-file-button">
              {{ $t('common.delete') }}
            </button>
          </li>
        </ul>
      </div>

      <div class="button-group">
        <AddNewsSubmitButton :is-loading="isLoading" :submit-label="$t('news.addForm.submit')" />
        <CancelButton />
      </div>
    </form>

    <!-- プレビュー用モーダル -->
    <NewsPreviewModal :is-open="isPreviewModalVisible" @close="isPreviewModalVisible = false">
      <div class="preview-modal-content">
        <h2 class="preview-title">{{ $t('common.preview') }}</h2>
        <NewsPreview :news-item="previewNewsItem" />
        <button class="action-button close-preview-button" @click="isPreviewModalVisible = false">
          {{ $t('common.close') }}
        </button>
      </div>
    </NewsPreviewModal>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

import AddNewsSubmitButton from './AddNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';
import NewsPreviewModal from '../NewsPreviewModal.vue';
import NewsPreview from '../NewsPreview.vue';

const { t } = useI18n();

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
const isPreviewModalVisible = ref(false);
const deletedAttachmentIds = ref([]); // 削除された既存ファイルのIDを保持

// title/content/importance は reactive のまま、attachments は ref にして再代入の地雷を回避
const formData = reactive({
  title: props.initialData.title ?? '',
  content: props.initialData.content ?? '',
  importance: props.initialData.importance ?? false,
});

// 既存添付も含めて管理（既存: idあり、新規: File）
const attachments = ref(
  props.initialData.attachments ? [...props.initialData.attachments] : []
);

// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトからファイル名を取得
const getFileName = (file) => {
  return file?.name || file?.attached_file_name || t('common.unknownFile');
};

// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトからファイルサイズを取得
const formatBytes = (bytes) => {
  if (typeof bytes !== 'number') return t('common.na');
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
};

const getFileSize = (file) => {
  if (file instanceof File && typeof file.size === 'number') {
    return formatBytes(file.size);
  }
  if (typeof file?.attached_file_size === 'number') {
    return formatBytes(file.attached_file_size);
  }
  return t('common.na');
};

// ヘルパー関数: Fileオブジェクトまたは既存の添付オブジェクトの一意な識別子を生成
const getFileIdentifier = (file) => {
  return file?.id || `${file?.name}-${file?.size}-${file?.lastModified}`;
};

const revokeTempUrls = (files) => {
  files.forEach((f) => {
    if (f instanceof File && f._url) {
      URL.revokeObjectURL(f._url);
    }
  });
};

const handleFileChange = (event) => {
  attachmentError.value = null;
  const input = event.target;
  const selectedFiles = Array.from(input.files || []);

  // 現在保持している「新規File」のURLは、仕様上「新規ファイルは置き換え」なので先に解放
  const currentNewFiles = attachments.value.filter((f) => f instanceof File);
  revokeTempUrls(currentNewFiles);

  const existingFilesCount = attachments.value.filter((f) => f && f.id).length;

  // サイズチェック
  for (const file of selectedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      attachmentError.value = t('news.addForm.fileTooLarge', {
        name: file.name,
        maxMb: MAX_FILE_SIZE / (1024 * 1024),
      });
      input.value = '';
      return;
    }
  }

  // 件数チェック（既存 + 今回選択）
  if (existingFilesCount + selectedFiles.length > MAX_FILES) {
    attachmentError.value = t('news.addForm.tooManyFiles', { max: MAX_FILES });
    input.value = '';
    return;
  }

  // 新規追加ファイルのURLを作成してFileに保持（プレビュー用）
  selectedFiles.forEach((file) => {
    file._url = URL.createObjectURL(file);
  });

  // 既存（idあり）は残し、新規（File）は今回選択分で置き換え
  attachments.value = [
    ...attachments.value.filter((f) => f && f.id),
    ...selectedFiles,
  ];

  // 同じファイルを再選択できるようにリセット
  input.value = '';
};

const removeFile = (index) => {
  const fileToRemove = attachments.value[index];

  if (fileToRemove?.id) {
    deletedAttachmentIds.value.push(fileToRemove.id);
  }

  if (fileToRemove instanceof File && fileToRemove._url) {
    URL.revokeObjectURL(fileToRemove._url);
  }

  attachments.value.splice(index, 1);
};

const handleSubmit = () => {
  if (!formData.title || !formData.content) {
    alert(t('news.addForm.validationRequiredTitleContent'));
    return;
  }

  const submitFormData = new FormData();
  submitFormData.append('title', formData.title);
  submitFormData.append('content', formData.content);
  submitFormData.append('importance', String(formData.importance));

  // 新規追加された File のみ送る
  attachments.value.forEach((file) => {
    if (file instanceof File) {
      submitFormData.append('attachment_files', file);
    }
  });

  // 削除された既存添付のID
  deletedAttachmentIds.value.forEach((id) => {
    submitFormData.append('delete_file_ids', id);
  });

  emit('submit-data', submitFormData);
};

const previewNewsItem = computed(() => {
  const previewAttachments = [];

  attachments.value.forEach((file) => {
    if (file instanceof File && file._url) {
      previewAttachments.push({
        attached_file_url: file._url,
        attached_file_name: file.name,
      });
      return;
    }

    if (file?.attached_file_url) {
      previewAttachments.push({
        attached_file_url: file.attached_file_url,
        attached_file_name: file.attached_file_name || file.name || t('common.unknownFile'),
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

onUnmounted(() => {
  // アンマウント時に一時URLを解放
  revokeTempUrls(attachments.value);
});
</script>

<style scoped>
.news-form-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-top: 20px;
  position: relative;
}

/* プレビューボタンを右上に配置 */
.form-top-right-button {
  position: absolute;
  top: 30px;
  right: 30px;
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
.inline-label-group input[type='text'],
.inline-label-group textarea {
  flex-grow: 1;
  width: auto;
}

.form-group input[type='text'],
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
  flex-wrap: wrap;
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

.button-group {
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  padding-top: 30px;
  margin-left: 170px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
  font-size: 1rem;
  padding: 12px 25px;
  min-width: 150px;
  font-weight: bold;
}

/* プレビューボタン */
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
  gap: 12px;
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
  flex-shrink: 0;
}

.remove-file-button:hover {
  background-color: #d13d3d;
}
</style>
