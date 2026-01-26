<template>
  <div class="form-section">
    <label class="form-label">
      {{ t('news.form.thumbnail.label') }}
      <span class="optional">{{ t('form.optional') }}</span>
    </label>

    <div class="upload-area">
      <input
        type="file"
        id="main-thumbnail"
        ref="fileInput"
        accept="image/*"
        @change="handleFileChange"
        style="display: none;"
      >

      <div v-if="previewUrl" class="image-preview-wrapper">
        <img :src="previewUrl" :alt="t('news.form.thumbnail.previewAlt')" class="image-preview">
        <button type="button" class="remove-button" @click="removeImage">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <button
        v-else
        type="button"
        class="select-button"
        @click="openFileInput"
      >
        <span class="material-symbols-outlined" aria-hidden="true">upload_file</span>
        {{ t('news.form.thumbnail.select') }}
      </button>
    </div>

    <p class="help-text">{{ t('news.form.thumbnail.help') }}</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: [File, String, null], // File or existing URL
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const fileInput = ref(null);
const previewUrl = ref(null);

// createObjectURL で作ったURLだけ revoke するために保持
const objectUrl = ref(null);

const revokeObjectUrlIfNeeded = () => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }
};

const setPreview = (value) => {
  // 以前の blob URL を解放
  revokeObjectUrlIfNeeded();

  if (value instanceof File) {
    const url = URL.createObjectURL(value);
    objectUrl.value = url;
    previewUrl.value = url;
    return;
  }

  if (typeof value === 'string' && value) {
    // 既存URLは revoke 対象外
    previewUrl.value = value;
    return;
  }

  previewUrl.value = null;
};

onMounted(() => {
  setPreview(props.modelValue);
});

watch(
  () => props.modelValue,
  (newValue) => setPreview(newValue)
);

const openFileInput = () => {
  if (!fileInput.value) return;
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const files = event?.target?.files;
  const file = files && files[0] ? files[0] : null;

  if (file) {
    emit('update:modelValue', file);
  }

  // 同じファイルを再選択できるようにリセット
  if (event?.target) event.target.value = '';
};

const removeImage = () => {
  revokeObjectUrlIfNeeded();
  previewUrl.value = null;

  if (fileInput.value) {
    fileInput.value.value = '';
  }

  emit('update:modelValue', null);
};

onUnmounted(() => {
  revokeObjectUrlIfNeeded();
});
</script>

<style scoped>
.form-section {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  text-align: left;
  font-size: 1rem;
  margin-bottom: 10px;
  color: #333;
  font-weight: bold;
}

.optional {
  color: #555;
  font-weight: normal;
  font-size: 0.85rem;
  margin-left: 5px;
}

.help-text {
  font-size: 0.85rem;
  color: #777;
  margin-top: 5px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  text-align: center;
  position: relative;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #fff;
  color: #f15b5b;
  border: 1px solid #f15b5b;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.select-button:hover {
  background-color: #ffeaea;
}

.image-preview-wrapper {
  position: relative;
  max-width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 5px;
}

.image-preview {
  display: block;
  width: auto;
  max-height: 300px;
  object-fit: contain;
}

.remove-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background-color: rgba(241, 91, 91, 0.8);
}
</style>
