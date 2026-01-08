<template>
  <form @submit.prevent="onSubmit" class="news-form-card">
    
    <div class="form-group inline-label-group">
      <label for="title" class="form-label">タイトル <span class="required">(必須)</span></label>
      <input 
        id="title"
        v-model="formData.title" 
        type="text" 
        required
        placeholder="タイトルを入力してください"
        class="form-input"
      >
    </div>

    <div class="form-group inline-label-group">
      <label for="content" class="form-label">本文 <span class="required">(必須)</span></label>
      <textarea 
        id="content"
        v-model="formData.content" 
        rows="5"
        placeholder="本文を入力してください"
        class="form-input"
      ></textarea>
    </div>

    <!-- Existing Images Section (for Edit mode) -->
    <div v-if="isEdit && existingImages && existingImages.length > 0" class="form-group inline-label-group">
      <label class="form-label">現在の画像</label>
      <div class="input-area">
        <div class="existing-images-grid">
          <div v-for="image in existingImages" :key="image.id" class="existing-image-item">
            <template v-if="getFileTypeAndUrl(image).type === 'image'">
              <img :src="getFileTypeAndUrl(image).url" :alt="formData.title" class="existing-image-thumb" />
            </template>
            <template v-else-if="getFileTypeAndUrl(image).type === 'pdf'">
              <PdfThumbnail
                :pdf-url="getFileTypeAndUrl(image).url"
                :max-height="100"
                class="existing-image-thumb-pdf"
              />
            </template>
            <div v-else class="existing-image-no-preview">No Preview</div>
            <span @click="requestImageDeletion(image.id)" class="remove-file-btn">削除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- New Image Upload -->
    <div class="form-group inline-label-group">
      <label class="form-label">{{ isEdit ? '画像を追加' : '画像 (複数選択可)' }}</label>
      <div class="input-area">
        <div class="file-input-wrapper">
          <input 
            type="file" 
            @change="handleFileUpload" 
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp"
            class="native-file-input" 
          />
          <button type="button" class="custom-file-select-button">
            ファイルを選択
          </button>
        </div>
        <!-- Newly Selected Files Preview -->
        <div v-if="tempImageUrls.length > 0" class="newly-selected-files-grid">
          <div v-for="(temp, index) in tempImageUrls" :key="temp.id" class="new-image-item">
            <img v-if="temp.file.type.startsWith('image/')" :src="temp.url" class="new-image-thumb" :alt="temp.file.name" />
            <PdfThumbnail v-else-if="temp.file.type === 'application/pdf'" :pdf-url="temp.url" :max-height="100" class="new-image-thumb" />
            <div v-else class="new-image-placeholder">{{ temp.file.name }}</div>
            <span @click="removeNewlySelectedFile(index)" class="remove-file-btn">×</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Action Buttons -->
    <div class="button-group">
      <button 
        type="submit" 
        class="action-button submit-button"
        :disabled="isSubmitting"
      >
        {{ isEdit ? '更新' : '投稿' }}
      </button>
      <button type="button" class="action-button preview-button" @click="isPreviewModalVisible = true">プレビュー</button>
      <button 
        type="button" 
        @click="$emit('cancel')" 
        class="action-button cancel-button"
      >
        キャンセル
      </button>
    </div>
  </form>

  <!-- プレビュー用モーダル -->
  <GalleryPreviewModal :is-open="isPreviewModalVisible" @close="isPreviewModalVisible = false">
    <div class="preview-modal-content">
      <h2 class="preview-title">プレビュー</h2>
      <GalleryPreview :gallery-item="previewGalleryItem" />
      <button class="action-button close-preview-button" @click="isPreviewModalVisible = false">閉じる</button>
    </div>
  </GalleryPreviewModal>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import PdfThumbnail from './PdfThumbnail.vue';
import GalleryPreviewModal from './GalleryPreviewModal.vue';
import GalleryPreview from './GalleryPreview.vue';

const props = defineProps({
  initialData: Object,
  isEdit: Boolean,
  isSubmitting: Boolean,
  existingImages: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['submit', 'cancel', 'delete-image']);

const isPreviewModalVisible = ref(false);
const tempImageUrls = ref([]); // { id: number, url: string, file: File }

const formData = ref({
  title: '',
  content: '',
  image_files: []
});

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value.title = newVal.title || '';
    formData.value.content = newVal.content || '';
  }
}, { immediate: true });

const handleFileUpload = (event) => {
  const newFiles = Array.from(event.target.files);
  formData.value.image_files.push(...newFiles);

  newFiles.forEach(file => {
    const url = URL.createObjectURL(file);
    tempImageUrls.value.push({
      id: Date.now() + Math.random(), // simple unique id
      url: url,
      file: file // for later reference
    });
  });

  event.target.value = null;
};

const removeNewlySelectedFile = (index) => {
  const fileToRemove = formData.value.image_files[index];
  formData.value.image_files.splice(index, 1);

  const tempUrlIndex = tempImageUrls.value.findIndex(t => t.file === fileToRemove);
  if (tempUrlIndex !== -1) {
    URL.revokeObjectURL(tempImageUrls.value[tempUrlIndex].url);
    tempImageUrls.value.splice(tempUrlIndex, 1);
  }
};

const requestImageDeletion = (imageId) => {
  emit('delete-image', imageId);
};

const onSubmit = () => {
  emit('submit', {
    title: formData.value.title,
    content: formData.value.content,
    image_files: formData.value.image_files,
  });
};

const previewGalleryItem = computed(() => {
  // 新規追加された画像のプレビュー用データ
  const newImagesForPreview = tempImageUrls.value.map(temp => ({
    url: temp.url, // URL.createObjectURLで生成したURL
    type: temp.file.type, // ファイルタイプ
  }));
  
  // 既存の画像と新規画像を結合
  const allImages = [...props.existingImages, ...newImagesForPreview];

  return {
    title: formData.value.title,
    content: formData.value.content,
    images: allImages,
  };
});

onUnmounted(() => {
  tempImageUrls.value.forEach(temp => URL.revokeObjectURL(temp.url));
});

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getFileTypeAndUrl = (file) => {
  const fileUrl = file.file_url || file.attached_file;
  if (!fileUrl) {
    return { type: 'none', url: null };
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
.input-area {
  flex-grow: 1;
  width: auto;
}
.form-input, 
.form-textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}
.file-input-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
  margin-top: 0;
  height: 40px;
}
.native-file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.custom-file-select-button {
  background-color: #f15b5b;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  z-index: 0;
  height: 100%;
}
.custom-file-select-button:hover {
  background-color: #d84144;
}

/* Newly Selected Files Grid */
.newly-selected-files-grid {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}
.new-image-item {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.new-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.new-image-placeholder {
  font-size: 0.8rem;
  color: #777;
  text-align: center;
  padding: 5px;
  word-break: break-all;
}
.remove-file-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 16px;
  width: 16px;
  height: 16px;
  text-align: center;
  padding: 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.new-image-item:hover .remove-file-btn {
  opacity: 1;
}

.existing-images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}
.existing-image-item {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 5px;
  box-sizing: border-box;
}
.existing-image-item .remove-file-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 0.7rem;
    padding: 2px 5px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 3px;
}
.existing-image-thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
.existing-image-thumb-pdf {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
.existing-image-no-preview {
  font-size: 0.8rem;
  color: #777;
  text-align: center;
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
.cancel-button {
  background-color: #8D8D8D;
  color: #fff;
}
.cancel-button:hover {
  background-color: #6B6B6B;
}
.submit-button {
  background-color: #f15b5b;
  color: #fff;
  font-weight: bold;
}
.submit-button:hover:not(:disabled) {
  background-color: #e04b4b;
}
.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.required {
  color: #f15b5b;
  margin-left: 4px;
  font-size: 0.8rem;
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