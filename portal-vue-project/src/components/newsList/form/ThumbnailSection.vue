<template>
  <div class="form-section">
    <label class="form-label">
      メインサムネイル画像 <span class="optional">(任意)</span>
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
        <img :src="previewUrl" alt="画像プレビュー" class="image-preview">
        <button type="button" class="remove-button" @click="removeImage">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <button 
        v-else 
        type="button" 
        class="select-button" 
        @click="openFileInput"
      >
        <span class="material-symbols-outlined">upload_file</span>
        画像を選択 (クリックまたはドラッグ&ドロップ)
      </button>
    </div>
    <p class="help-text">JPG, PNGなどの画像ファイルをアップロードしてください。</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [File, String, null], // Fileオブジェクトまたは既存のURL
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const previewUrl = ref(null);

// 既存の値からプレビューを設定
const setPreview = (value) => {
  if (value instanceof File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target.result;
    };
    reader.readAsDataURL(value);
  } else if (typeof value === 'string' && value) {
    // 既存のURLが渡された場合（編集時）
    previewUrl.value = value;
  } else {
    previewUrl.value = null;
  }
};

onMounted(() => {
  setPreview(props.modelValue);
});

watch(() => props.modelValue, (newValue) => {
  setPreview(newValue);
});

/**
 * ファイル入力ダイアログを開く
 */
const openFileInput = () => {
  fileInput.value.click();
};

/**
 * ファイルが選択されたときの処理
 * @param {Event} event 
 */
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit('update:modelValue', file); // Fileオブジェクトを親に渡す
  }
};

/**
 * 画像を削除し、モデルの値をリセット
 */
const removeImage = () => {
  previewUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = ''; // ファイルインプットをリセット
  }
  emit('update:modelValue', null);
};
</script>

<style scoped>
/* 共通スタイル */
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

/* アップロードエリア */
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

/* プレビュー */
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