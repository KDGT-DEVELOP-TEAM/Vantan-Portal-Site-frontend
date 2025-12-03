<template>
  <form @submit.prevent="handleSubmit" class="news-form-container">
    <div v-if="submitError" class="error-message">{{ submitError }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    
    <!-- 1. タイトル -->
    <TitleSection 
      v-model="formData.title" 
      :is-error="!!errors.title" 
      :error-text="errors.title" 
    />

    <!-- 2. 本文 -->
    <ContentSection 
      v-model="formData.content" 
      :is-error="!!errors.content" 
      :error-text="errors.content" 
    />
    
    <!-- 3. 公開設定 -->
    <div class="form-group-inline">
      <!-- 重要度 -->
      <div class="form-section flex-item">
        <label class="form-label">重要度</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="formData.is_important" :value="true"> 重要
          </label>
          <label>
            <input type="radio" v-model="formData.is_important" :value="false"> 通常
          </label>
        </div>
      </div>
      
      <!-- 公開/非公開 -->
      <div class="form-section flex-item">
        <label class="form-label">公開設定</label>
        <select v-model="formData.status" class="form-select">
          <option value="published">公開</option>
          <option value="draft">非公開（下書き）</option>
        </select>
      </div>

      <!-- 公開日 -->
      <div class="form-section flex-item">
        <label class="form-label">公開日</label>
        <input type="date" v-model="formData.published_at" class="form-input-date" required>
      </div>
    </div>

    <!-- 4. メインサムネイル -->
    <ThumbnailSection v-model="formData.thumbnail_file" />

    <!-- 5. サブサムネイル -->
    <SubThumbnailSection v-model="formData.sub_thumbnail_file" />

    <!-- 6. 関連URL -->
    <URLSection v-model="formData.related_url" />

    <!-- 送信ボタン -->
    <AddNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
// import axios from 'axios';
import TitleSection from '../form/TitleSection.vue';
import ContentSection from '../form/ContentSection.vue';
import ThumbnailSection from '../form/ThumbnailSection.vue';
import SubThumbnailSection from '../form/SubThumbnailSection.vue';
import URLSection from '../form/URLSection.vue';
import AddNewsSubmitButton from './AddNewsSubmitButton.vue';

// フォームデータの初期値
const initialFormData = {
  title: '',
  content: '',
  is_important: false,
  status: 'published', // 'published' or 'draft'
  published_at: new Date().toISOString().split('T')[0], // 今日の日付
  thumbnail_file: null, // FileオブジェクトまたはURL
  sub_thumbnail_file: null, // FileオブジェクトまたはURL
  related_url: '',
};

const formData = reactive({ ...initialFormData });
const isLoading = ref(false);
const submitError = ref(null);
const successMessage = ref(null);
const errors = reactive({}); // 個別フィールドのエラーメッセージ

/**
 * フォームデータのバリデーション
 */
const validateForm = () => {
  errors.title = formData.title ? '' : 'タイトルは必須です。';
  errors.content = formData.content ? '' : '本文は必須です。';

  return !errors.title && !errors.content;
};

/**
 * フォーム送信処理
 */
const handleSubmit = async () => {
  submitError.value = null;
  successMessage.value = null;

  if (!validateForm()) {
    submitError.value = '入力内容にエラーがあります。確認してください。';
    return;
  }

  isLoading.value = true;
  try {
    // API送信用のFormDataを作成
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('content', formData.content);
    payload.append('is_important', formData.is_important);
    payload.append('status', formData.status);
    payload.append('published_at', formData.published_at);
    if (formData.thumbnail_file instanceof File) {
      payload.append('thumbnail_file', formData.thumbnail_file);
    }
    if (formData.sub_thumbnail_file instanceof File) {
      payload.append('sub_thumbnail_file', formData.sub_thumbnail_file);
    }
    if (formData.related_url) {
      payload.append('related_url', formData.related_url);
    }
    
    console.log('--- 送信データ（追加） ---', formData);

    // 実際には axios.post('/api/news/', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    await new Promise(resolve => setTimeout(resolve, 1000)); // 擬似遅延

    successMessage.value = 'お知らせが正常に投稿されました。';
    
    // 成功後、フォームをリセット
    Object.assign(formData, initialFormData);

  } catch (err) {
    console.error('お知らせ投稿エラー:', err);
    // err.response.dataなどからエラーメッセージを取得する想定
    submitError.value = 'お知らせの投稿に失敗しました。サーバーエラーを確認してください。';
  } finally {
    isLoading.value = false;
  }
};
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

.error-message {
  padding: 10px;
  background-color: #ffe0e0;
  color: #cc0000;
  border: 1px solid #cc0000;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.success-message {
  padding: 10px;
  background-color: #e0ffe0;
  color: #008000;
  border: 1px solid #008000;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

/* フォームグループ */
.form-group-inline {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.flex-item {
  flex: 1;
  min-width: 150px;
}

.form-label {
  display: block;
  font-size: 1rem;
  margin-bottom: 5px;
  color: #333;
  font-weight: bold;
}

/* ラジオボタン */
.radio-group {
  display: flex;
  gap: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.radio-group label {
  font-weight: normal;
  color: #555;
}

/* セレクトボックス */
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
}

/* 日付入力 */
.form-input-date {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
}

/* スマホ対応 */
@media (max-width: 600px) {
  .news-form-container {
    padding: 20px;
  }
  .form-group-inline {
    flex-direction: column;
    gap: 15px;
  }
}
</style>