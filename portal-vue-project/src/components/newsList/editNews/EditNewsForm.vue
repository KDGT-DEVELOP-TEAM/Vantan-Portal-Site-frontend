<template>
  <div v-if="initialLoading" class="loading-message">お知らせ情報を読み込み中...</div>
  <div v-else-if="fetchError" class="error-message">{{ fetchError }}</div>

  <form v-else @submit.prevent="handleSubmit" class="news-form-container">
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
      <label for="file" class="form-label">添付ファイル (任意)</label>
      <p v-if="existingFileName" class="existing-file">現在のファイル: {{ existingFileName }}</p>
      <p class="file-instruction">新しいファイルをアップロードすると、既存の添付ファイルが上書きされます。</p>
      <input id="file" type="file" @change="handleFileChange" class="form-input-file">
    </div>

    <div class="button-group">
      <EditNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
      <CancelButton @click="$router.back()" />
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchNewsForEdit, updateNewsWithFeedback } from '@/api/news'; 
import EditNewsSubmitButton from './EditNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';

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

const existingFileName = ref('');

const formData = reactive({
  title: '',
  content: '',
  importance: false,
  attached_file: null,
});

const handleFileChange = (event) => {
  const file = event.target.files ? event.target.files[0] : null;
  formData.attached_file = file;
};

const handleSubmit = () => {
  updateNewsWithFeedback(props.newsId, formData, router, isLoading, submitError, successMessage, errors);
};

onMounted(async () => {
  await fetchNewsForEdit(props.newsId, initialLoading, fetchError, formData, existingFileName);
  if (!fetchError.value) {
    emits('newsFetched', formData.title);
  }
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

.existing-file {
  font-style: italic;
  color: #555;
  margin-bottom: 5px;
}

.file-instruction {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 10px;
}

.button-group {
  display: flex; 
  gap: 15px;
  justify-content: flex-end; 
  margin-top: 30px;
}
</style>