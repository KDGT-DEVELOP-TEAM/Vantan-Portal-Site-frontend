<template>
  <div v-if="initialLoading" class="loading-message">
    {{ $t('news.editForm.loading') }}
  </div>
  <div v-else-if="fetchError" class="error-message">
    {{ fetchError }}
  </div>

  <form v-else @submit.prevent="handleSubmit" class="news-form-container">
    <button
      type="button"
      class="action-button preview-button form-top-right-button"
      @click="isPreviewModalVisible = true"
    >
      {{ $t('common.preview') }}
    </button>

    <div v-if="submitError" class="error-message">{{ submitError }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

    <!-- Title -->
    <div class="form-group">
      <label for="title" class="form-label">
        {{ $t('common.title') }}
        <span class="required">{{ $t('common.required') }}</span>
      </label>
      <input
        id="title"
        type="text"
        v-model="formData.title"
        class="form-input"
        required
      />
      <div v-if="errors.title" class="error-text-inline">{{ errors.title }}</div>
    </div>

    <!-- Content -->
    <div class="form-group">
      <label for="content" class="form-label">
        {{ $t('common.content') }}
        <span class="required">{{ $t('common.required') }}</span>
      </label>
      <textarea
        id="content"
        v-model="formData.content"
        rows="10"
        class="form-textarea"
        required
      ></textarea>
      <div v-if="errors.content" class="error-text-inline">{{ errors.content }}</div>
    </div>

    <!-- Importance -->
    <div class="form-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="formData.importance" />
        {{ $t('news.editForm.markImportant') }}
      </label>
    </div>

    <!-- File Attachment -->
    <div class="form-group">
      <label class="form-label">
        {{ $t('news.editForm.attachments') }} {{ $t('common.optional') }}
      </label>

      <div class="file-upload-area">
        <label class="file-select-button">
          {{ $t('common.chooseFile') }}
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp"
            @change="handleFileChange"
            style="display: none;"
          />
        </label>

        <p class="hint">
          {{ $t('common.maxFilesHint', { max: MAX_FILES }) }}
        </p>

        <p v-if="attachmentError" class="error-message">{{ attachmentError }}</p>
      </div>

      <div class="file-thumbnail-container" v-if="attachmentsForView.length > 0">
        <div
          v-for="(file, index) in attachmentsForView"
          :key="file.key"
          class="thumbnail-item"
        >
          <div class="thumbnail-preview" :title="file.name">
            <template v-if="isImageName(file.name)">
              <img :src="file.url" :alt="file.name" class="thumbnail-image" />
            </template>
            <template v-else>
              <PdfThumbnail v-if="file.url" :pdf-url="file.url" :max-height="120" />
              <div v-else class="file-icon">{{ file.ext }}</div>
            </template>
          </div>

          <button
            type="button"
            @click="removeFile(index)"
            class="remove-file-button"
            :title="$t('news.editForm.removeFile')"
          >
            &times;
          </button>
        </div>
      </div>
    </div>

    <div class="button-group">
      <!-- EditNewsSubmitButton が内部で submit する作りなら @submit は不要。
           ただし現状踏襲で置く -->
      <EditNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
      <CancelButton @click="$router.back()" />
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

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

const emits = defineEmits(['newsFetched']);

const router = useRouter();
const { t } = useI18n();

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

// フォーム本体（templateと統一）
const formData = reactive({
  title: '',
  content: '',
  importance: false,
});

// 既存添付（API由来: id, attached_file_url, attached_file_name ... を想定）
const existingAttachments = ref([]);

// 新規添付（File）
const newAttachments = ref([]);

// new file -> blob url
const previewUrls = ref(new Map());

// 既存添付の削除対象ID
const deletedAttachmentIds = ref([]);

const isImageName = (name) => /\.(jpg|jpeg|png|gif|svg|bmp)$/i.test(name || '');
const getExt = (name) => {
  const part = String(name || '').split('.').pop();
  return part ? part.toUpperCase() : '';
};

const getExistingUrl = (att) => att?.attached_file_url || att?.file_url || att?.url || null;
const getExistingName = (att) => att?.attached_file_name || att?.name || t('common.unknownFile');

// 表示用：既存 + 新規 を統合
const attachmentsForView = computed(() => {
  const list = [];

  existingAttachments.value.forEach((att) => {
    const name = getExistingName(att);
    list.push({
      kind: 'existing',
      id: att.id,
      key: `ex-${att.id}`,
      name,
      url: getExistingUrl(att),
      ext: getExt(name),
    });
  });

  newAttachments.value.forEach((file) => {
    const url = previewUrls.value.get(file) || null;
    const name = file?.name || t('common.unknownFile');
    list.push({
      kind: 'new',
      file,
      key: `new-${name}-${file?.lastModified}-${file?.size}`,
      name,
      url,
      ext: getExt(name),
    });
  });

  return list;
});

const handleFileChange = (event) => {
  attachmentError.value = null;
  const input = event.target;
  const selectedFiles = Array.from(input.files || []);

  // 合計件数
  const total = existingAttachments.value.length + newAttachments.value.length + selectedFiles.length;
  if (total > MAX_FILES) {
    attachmentError.value = t('common.tooManyFiles', { max: MAX_FILES });
    input.value = '';
    return;
  }

  // サイズチェック
  for (const file of selectedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      attachmentError.value = t('common.fileTooLarge', {
        name: file.name,
        maxMb: MAX_FILE_SIZE / (1024 * 1024),
      });
      input.value = '';
      return;
    }
  }

  // 追加 + URL作成
  selectedFiles.forEach((file) => {
    newAttachments.value.push(file);
    previewUrls.value.set(file, URL.createObjectURL(file));
  });

  input.value = '';
};

// index から削除（既存/新規を判定）
const removeFile = (index) => {
  const item = attachmentsForView.value[index];
  if (!item) return;

  if (item.kind === 'existing') {
    // 既存: delete ids に追加して一覧から除去
    deletedAttachmentIds.value.push(item.id);
    existingAttachments.value = existingAttachments.value.filter((a) => a.id !== item.id);
    return;
  }

  if (item.kind === 'new') {
    const file = item.file;
    const url = previewUrls.value.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      previewUrls.value.delete(file);
    }
    newAttachments.value = newAttachments.value.filter((f) => f !== file);
  }
};

const handleSubmit = async () => {
  submitError.value = null;
  successMessage.value = null;
  attachmentError.value = null;
  errors.title = '';
  errors.content = '';

  // Front validation
  let ok = true;
  if (!formData.title) {
    errors.title = t('news.editForm.validationTitleRequired');
    ok = false;
  }
  if (!formData.content) {
    errors.content = t('news.editForm.validationContentRequired');
    ok = false;
  }
  if (!ok) {
    submitError.value = t('news.editForm.validationFix');
    return;
  }

  isLoading.value = true;

  const submitFormData = new FormData();
  submitFormData.append('title', formData.title);
  submitFormData.append('content', formData.content);
  submitFormData.append('importance', String(formData.importance));

  // 新規ファイル
  newAttachments.value.forEach((file) => {
    submitFormData.append('attachment_files', file); // ✅ typo修正
  });

  // 削除ID
  deletedAttachmentIds.value.forEach((id) => {
    submitFormData.append('delete_file_ids', String(id));
  });

  try {
    await updateNews(props.newsId, submitFormData);

    successMessage.value = t('news.editForm.updateSuccess');
    setTimeout(() => router.push(`/news/${props.newsId}`), 800);
  } catch (err) {
    console.error('news update error:', err);

    // 400: バリデーションエラーを拾う（DRFの形に寄せる）
    if (err?.response?.status === 400 && err?.response?.data) {
      submitError.value = t('news.editForm.updateBadRequest');

      const data = err.response.data;
      // 例: { title: ["..."], content: ["..."] }
      if (data.title && errors.title !== undefined) {
        errors.title = Array.isArray(data.title) ? data.title.join(' ') : String(data.title);
      }
      if (data.content && errors.content !== undefined) {
        errors.content = Array.isArray(data.content) ? data.content.join(' ') : String(data.content);
      }
    } else {
      const detail = err?.response?.data?.detail;
      submitError.value = t('news.editForm.updateFailed', {
        detail: detail || t('common.serverError'),
      });
    }
  } finally {
    isLoading.value = false;
  }
};

const previewNewsItem = computed(() => {
  const previewAttachments = [];

  // 既存
  existingAttachments.value.forEach((att) => {
    previewAttachments.push({
      attached_file_url: getExistingUrl(att),
      attached_file_name: getExistingName(att),
    });
  });

  // 新規
  newAttachments.value.forEach((file) => {
    const url = previewUrls.value.get(file);
    if (url) {
      previewAttachments.push({
        attached_file_url: url,
        attached_file_name: file.name,
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
  fetchError.value = null;

  try {
    const response = await getNewsDetail(props.newsId);
    const data = response?.data;

    formData.title = data?.title ?? '';
    formData.content = data?.content ?? '';
    formData.importance = !!data?.importance;

    existingAttachments.value = Array.isArray(data?.attachments) ? [...data.attachments] : [];
    newAttachments.value = [];
    deletedAttachmentIds.value = [];

    emits('newsFetched', formData.title);
  } catch (err) {
    console.error(err);
    fetchError.value = t('news.editForm.fetchFailed');
  } finally {
    initialLoading.value = false;
  }
});

onUnmounted(() => {
  // 新規ファイルのblob urlを解放
  previewUrls.value.forEach((url) => URL.revokeObjectURL(url));
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
  position: relative;
}

.form-top-right-button {
  position: absolute;
  top: 10px;
  right: 30px;
}

.loading-message,
.error-message,
.success-message {
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

.form-input,
.form-textarea {
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

.required {
  color: #f15b5b;
  margin-left: 6px;
  font-size: 0.8rem;
}
</style>
