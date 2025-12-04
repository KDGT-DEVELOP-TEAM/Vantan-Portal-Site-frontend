<template>
  <div v-if="initialLoading" class="loading-message">お知らせ情報を読み込み中...</div>
  <div v-else-if="fetchError" class="error-message">{{ fetchError }}</div>

  <form v-else @submit.prevent="handleSubmit" class="news-form-container">
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
    <!-- 既存のURLまたは新しくアップロードされたFileを渡す -->
    <ThumbnailSection v-model="formData.thumbnail_file" />

    <!-- 5. サブサムネイル -->
    <SubThumbnailSection v-model="formData.sub_thumbnail_file" />

    <!-- 6. 関連URL -->
    <URLSection v-model="formData.related_url" />

    <div class="button-group">
      <!-- 送信ボタン -->
    <EditNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
    <!-- キャンセルボタン -->
    <CancelButton />
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import TitleSection from '../form/TitleSection.vue';
import ContentSection from '../form/ContentSection.vue';
import ThumbnailSection from '../form/ThumbnailSection.vue';
import SubThumbnailSection from '../form/SubThumbnailSection.vue';
import URLSection from '../form/URLSection.vue';
import EditNewsSubmitButton from './EditNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';

const props = defineProps({
  newsId: {
    type: [String, Number],
    required: true,
  },
});

const initialLoading = ref(true);
const fetchError = ref(null);
const isLoading = ref(false);
const submitError = ref(null);
const successMessage = ref(null);
const errors = reactive({}); // 個別フィールドのエラーメッセージ

const formData = reactive({
  title: '',
  content: '',
  is_important: false,
  status: 'published',
  published_at: new Date().toISOString().split('T')[0],
  thumbnail_file: null, // FileオブジェクトまたはURL文字列
  sub_thumbnail_file: null, // FileオブジェクトまたはURL文字列
  related_url: '',
});

// Mockデータ
const mockDetail = {
  id: props.newsId,
  title: '既存の年末年始の休業日に関するお知らせ',
  content: '既存の本文が入ります。編集してください。',
  published_at: '2023-12-01',
  is_important: true,
  status: 'published',
  thumbnail_url: 'https://placehold.co/600x400/f15b5b/ffffff?text=Existing+Main',
  sub_thumbnail_url: 'https://placehold.co/200x150/4CAF50/ffffff?text=Existing+Sub',
  related_url: 'https://example.com/old-link',
};

/**
 * 既存のお知らせデータをAPIから取得し、フォームに設定 (Mock)
 */
const fetchNewsData = async () => {
  initialLoading.value = true;
  fetchError.value = null;
  try {
    console.log(`お知らせID: ${props.newsId} のデータを取得中...`);
    // 実際には const response = await axios.get(`/api/news/${props.newsId}`);
    // const data = response.data;
    await new Promise(resolve => setTimeout(resolve, 800)); // 擬似遅延
    const data = mockDetail;

    // フォームにデータを設定
    formData.title = data.title;
    formData.content = data.content;
    formData.is_important = data.is_important;
    formData.status = data.status;
    formData.published_at = data.published_at;
    // ファイルフィールドには既存のURLを設定
    formData.thumbnail_file = data.thumbnail_url;
    formData.sub_thumbnail_file = data.sub_thumbnail_url;
    formData.related_url = data.related_url;

  } catch (err) {
    console.error('お知らせデータ取得エラー:', err);
    fetchError.value = '編集のためのお知らせ情報の取得に失敗しました。';
  } finally {
    initialLoading.value = false;
  }
};


/**
 * フォームデータのバリデーション
 */
const validateForm = () => {
  errors.title = formData.title ? '' : 'タイトルは必須です。';
  errors.content = formData.content ? '' : '本文は必須です。';
  // URLの簡易バリデーション (URLSectionコンポーネント内でも可能だが、ここでは必須チェックのみ)
  // if (formData.related_url && !/^https?:\/\//.test(formData.related_url)) {
  //   errors.related_url = '有効なURLを入力してください。';
  // }

  return !errors.title && !errors.content;
};

/**
 * フォーム送信処理（更新）
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
    // API送信用のFormDataを作成 (PATCH/PUTを想定)
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('content', formData.content);
    payload.append('is_important', formData.is_important);
    payload.append('status', formData.status);
    payload.append('published_at', formData.published_at);
    payload.append('related_url', formData.related_url);

    // ファイル処理: Fileオブジェクトならアップロード、nullなら削除、文字列なら変更なしとして送信
    if (formData.thumbnail_file instanceof File) {
      payload.append('thumbnail_file', formData.thumbnail_file);
    } else if (formData.thumbnail_file === null) {
      // ファイルを削除したい場合は、専用のフィールドやフラグをAPIに送る必要がある
      payload.append('thumbnail_file_clear', 'true');
    }
    
    if (formData.sub_thumbnail_file instanceof File) {
      payload.append('sub_thumbnail_file', formData.sub_thumbnail_file);
    } else if (formData.sub_thumbnail_file === null) {
      payload.append('sub_thumbnail_file_clear', 'true');
    }
    
    console.log(`--- 送信データ（更新 ID: ${props.newsId}） ---`, formData);

    // 実際には axios.patch(`/api/news/${props.newsId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    await new Promise(resolve => setTimeout(resolve, 1000)); // 擬似遅延

    successMessage.value = 'お知らせが正常に更新されました。';
    
    // 成功後、リロードまたは詳細画面へ遷移する
    // router.push(`/news/${props.newsId}`);

  } catch (err) {
    console.error('お知らせ更新エラー:', err);
    submitError.value = 'お知らせの更新に失敗しました。サーバーエラーを確認してください。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchNewsData();
});
</script>

<style scoped>
/* AddNewsForm.vueと共通のスタイルを使用 */
.news-form-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.loading-message {
  text-align: center;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  margin-top: 20px;
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

.form-select, .form-input-date {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
}

.button-group {
  display: flex; 
  gap: 30px; 
  /* justify-content: flex-end; */ 
  margin-top: 30px;
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