<template>
  <form @submit.prevent="onSubmit" class="gallery-form-container">
    <div class="form-title">
      <label class="form-label">タイトル</label>
      <input 
        v-model="formData.title" 
        type="text" 
        required
        placeholder="タイトルを入力してください"
        class="form-input"
      />
    </div>

    <div class="form-content">
      <label class="form-label">本文</label>
      <textarea 
        v-model="formData.content" 
        rows="5"
        placeholder="本文を入力してください"
        class="form-input"
      ></textarea>
    </div>

    <div class="form-image">
      <label class="form-label">画像 (複数選択可)</label>
      <input 
        type="file" 
        @change="handleFileUpload" 
        multiple
        accept="image/*"
        class="form-file-input"
      />
    </div>

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
import { ref, watch } from 'vue';

const props = defineProps({
  initialData: Object, // 編集時の初期データ
  isEdit: Boolean,     // 編集モードフラグ
  isSubmitting: Boolean // 送信中フラグ
});

const emit = defineEmits(['submit', 'cancel']);

// フォームデータ
const formData = ref({
  title: '',
  content: '',
  files: []
});

// 初期データが渡されたら反映（編集画面用）
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value.title = newVal.title || '';
    formData.value.content = newVal.content || '';
  }
}, { immediate: true });

// ファイル選択時の処理
const handleFileUpload = (event) => {
  formData.value.files = Array.from(event.target.files);
};

// 送信処理
const onSubmit = () => {
  // FormDataオブジェクトを作成して親へ渡す
  const data = new FormData();
  data.append('title', formData.value.title);
  data.append('content', formData.value.content);
  
  formData.value.files.forEach((file) => {
    data.append('files', file); 
  });

  emit('submit', data);
};
</script>

<style scoped>


.gallery-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; 
  background-color: #fff; 
  padding: 1.5rem; 
  border-radius: 0.5rem; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); 
}


.form-input {
  width: 100%;
  border: 1px solid #d1d5db; 
  border-radius: 0.25rem; 
  padding: 0.5rem; 
  outline: none;
  box-sizing: border-box; 
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  
  border-color: #dc2626; 
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.5); 
}


.form-file-input {
  display: block;
  width: 100%;
  padding: 0; 
  cursor: pointer;
  color: #6b7280; 
  font-size: 0.875rem; 
}

.form-file-input::file-selector-button {
  margin-right: 1rem; 
  padding: 0.5rem 1rem; 
  border-radius: 0.25rem; 
  border: 0; 
  font-size: 0.875rem; 
  font-weight: 600; 
  background-color: #fee2e2;
  color: #b91c1c;
  transition: background-color 0.15s ease-in-out;
}

.form-file-input:hover::file-selector-button {
  background-color: #fecaca; 
}

.form-title,
.form-content,
.form-image {
    display: flex;
    flex-direction: row; 
    align-items: center;
    gap: 1.5rem;
}


.form-label {
  display: block;
  text-align: left;
  font-size: 0.875rem; 
  font-weight: bold; 
  color: #4b5563; 
  margin-bottom: 0; 
  min-width: 100px; 
  flex-shrink: 0; 
}

.button-group {
  display: flex;
  align-items: left;
  gap: 1rem; 
  margin-top: 1.5rem; 
}

.action-button {
  border: none;
  border-radius: 15px; 
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  font-size: 1rem;
}


.cancel-button {
  padding: 0.5rem 1rem; 
  background-color: #8D8D8D; 
  color: #fff;
}

.cancel-button:hover {
  background-color: #6B6B6B; 
}


.submit-button {
  padding: 0.5rem 1.5rem; 
  background-color: #F1494C; 
  color: #fff; 
  font-weight: bold; 
}

.submit-button:hover:not(:disabled) {
  background-color: #D84144;
}

.submit-button:disabled {
  opacity: 0.5; 
  cursor: not-allowed;
}
</style>