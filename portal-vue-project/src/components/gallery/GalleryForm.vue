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
            class="native-file-input" 
          />
          <button type="button" class="custom-file-select-button">
            ファイルを選択
          </button>
        </div>
        <div v-if="formData.image_files.length > 0" class="newly-selected-files">
          <h4>追加予定のファイル:</h4>
          <ul>
            <li v-for="(file, index) in formData.image_files" :key="index">
              {{ file.name }} (<span @click="removeNewlySelectedFile(index)" class="remove-file-btn">削除</span>)
            </li>
          </ul>
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
      <button 
        type="button" 
        @click="$emit('cancel')" 
        class="action-button cancel-button"
      >
        キャンセル
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import PdfThumbnail from './PdfThumbnail.vue'; // Import PdfThumbnail

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

const formData = ref({
  title: '',
  content: '',
  image_files: []
});

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value.title = newVal.title || '';
    formData.value.content = newVal.content || '';
    // formData.value.image_files = []; // Removed: This line was clearing selected files
  }
}, { immediate: true });

const handleFileUpload = (event) => {
  formData.value.image_files = [...formData.value.image_files, ...Array.from(event.target.files)];
  event.target.value = null; // This clears the input field
};

const removeNewlySelectedFile = (index) => {
  formData.value.image_files.splice(index, 1);
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

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getFileTypeAndUrl = (file) => {
  const fileUrl = file.file_url || file.attached_file; // Use file.file_url or file.attached_file
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
.news-form-card { /* Renamed from .gallery-form-container */
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
  width: 100%; /* Ensure inputs take full width of input-area */
  box-sizing: border-box; /* Include padding and border in element's total width and height */
}

/* Specific styles for new file input workaround */
.file-input-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
  margin-top: 0; /* Adjusted from 10px to fit inline-label-group */
  height: 40px; /* Give it a defined height */
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
  height: 100%; /* Match wrapper height */
}

.custom-file-select-button:hover {
  background-color: #d84144;
}

.newly-selected-files {
  margin-top: 15px;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.newly-selected-files h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #555;
}

.newly-selected-files ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.newly-selected-files li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px dotted #ddd;
  font-size: 0.9rem;
  color: #333;
}

.newly-selected-files li:last-child {
  border-bottom: none;
}

.remove-file-btn {
  color: #f15b5b;
  cursor: pointer;
  margin-left: 10px;
  font-weight: bold;
}

.remove-file-btn:hover {
  text-decoration: underline;
}

/* Existing Images Section Styles */
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
  width: 100px; /* Fixed width for thumbnail */
  height: 100px; /* Fixed height for thumbnail */
  display: flex; /* For centering content */
  align-items: center;
  justify-content: center;
  flex-direction: column; /* To stack image/preview and delete button */
  padding: 5px;
  box-sizing: border-box;
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

/* Button Group */
.button-group {
  display: flex;
  justify-content: flex-start; /* Left-aligned */
  gap: 15px; /* Spacing between buttons */
  padding-top: 30px;
  margin-left: 170px; /* Align with news form button group */
}

.action-button {
  border: none;
  border-radius: 5px; /* Adjust to match news form */
  cursor: pointer;
  transition: background-color 0.3s; /* Smoother transition */
  font-size: 1rem;
  padding: 10px 20px; /* Match news form button size */
}

.cancel-button {
  background-color: #8D8D8D;
  color: #fff;
}

.cancel-button:hover {
  background-color: #6B6B6B;
}

.submit-button {
  background-color: #f15b5b; /* Match news form submit button */
  color: #fff;
  font-weight: bold;
}

.submit-button:hover:not(:disabled) {
  background-color: #e04b4b; /* Darker red on hover */
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Required field indicator */
.required {
  color: #f15b5b;
  margin-left: 4px;
  font-size: 0.8rem;
}
</style>