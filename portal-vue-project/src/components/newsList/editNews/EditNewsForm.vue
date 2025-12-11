<template>
  <div v-if="initialLoading" class="loading-message">お知らせ情報を読み込み中...</div>
  <div v-else-if="fetchError" class="error-message">{{ fetchError }}</div>

  <form v-else @submit.prevent="handleSubmit" class="news-form-container">
    <div v-if="submitError" class="error-message">{{ submitError }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    
    <TitleSection 
      v-model="formData.title" 
      :is-error="!!errors.title" 
      :error-text="errors.title" 
    />

    <ContentSection 
      v-model="formData.content" 
      :is-error="!!errors.content" 
      :error-text="errors.content" 
    />
    
    <div class="form-group-inline">
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
      
      <div class="form-section flex-item">
        <label class="form-label">公開設定</label>
        <select v-model="formData.status" class="form-select">
          <option value="published">公開</option>
          <option value="draft">非公開（下書き）</option>
        </select>
      </div>

      <div class="form-section flex-item">
        <label class="form-label">公開日</label>
        <input type="date" v-model="formData.published_at" class="form-input-date" required>
        <div v-if="errors.published_at" class="error-text-inline">{{ errors.published_at }}</div>
      </div>
    </div>

    <ThumbnailSection v-model="formData.thumbnail_file" />
    <div v-if="errors.thumbnail_file" class="error-text-inline">{{ errors.thumbnail_file }}</div>

    <SubThumbnailSection v-model="formData.sub_thumbnail_file" />
    <div v-if="errors.sub_thumbnail_file" class="error-text-inline">{{ errors.sub_thumbnail_file }}</div>

    <URLSection v-model="formData.related_url" />
    <div v-if="errors.related_url" class="error-text-inline">{{ errors.related_url }}</div>

    <div class="button-group">
      <EditNewsSubmitButton :is-loading="isLoading" @submit="handleSubmit" />
    <CancelButton @click="$router.back()" />
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import authApi from '@/plugins/authApi'; // ★ 実際のAPIコールに使用
// コンポーネントのインポート
import TitleSection from '../form/TitleSection.vue';
import ContentSection from '../form/ContentSection.vue';
import ThumbnailSection from '../form/ThumbnailSection.vue';
import SubThumbnailSection from '../form/SubThumbnailSection.vue';
import URLSection from '../form/URLSection.vue';
import EditNewsSubmitButton from './EditNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue';
import { useRouter } from 'vue-router'; // ★ routerを使用するためインポート

const props = defineProps({
  newsId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter(); // ★ routerの初期化

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


/**
 * 既存のお知らせデータをAPIから取得し、フォームに設定
 */
const fetchNewsData = async () => {
  initialLoading.value = true;
  fetchError.value = null;
  try {
    // ★ 修正: 実際の API コール: GET /api/news/{id}
    const response = await authApi.get(`/api/news/${props.newsId}`);
    const data = response.data;

    // フォームにデータを設定
    formData.title = data.title;
    formData.content = data.content;
    formData.is_important = data.is_important;
    formData.status = data.status;
    // APIの published_at の形式が 'YYYY-MM-DD' でない場合、ここで変換が必要
    formData.published_at = data.published_at ? data.published_at.split('T')[0] : new Date().toISOString().split('T')[0]; 
    // ファイルフィールドには既存のURLを設定（APIレスポンスのフィールド名に依存）
    formData.thumbnail_file = data.thumbnail_url || null; 
    formData.sub_thumbnail_file = data.sub_thumbnail_url || null;
    formData.related_url = data.related_url || '';

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
  // エラーをリセット
  Object.keys(errors).forEach(key => errors[key] = '');

  let isValid = true;

  if (!formData.title) {
    errors.title = 'タイトルは必須です。';
    isValid = false;
  }
  if (!formData.content) {
    errors.content = '本文は必須です。';
    isValid = false;
  }
  
  // 他のバリデーションロジック (例: URL形式) をここに追加
  
  return isValid;
};

/**
 * フォーム送信処理（更新）
 */
const handleSubmit = async () => {
  submitError.value = null;
  successMessage.value = null;

  if (!validateForm()) {
    submitError.value = '入力内容にエラーがあります。確認してください。';
    // エラーのある最初のフィールドにスクロールさせるなどのUX改善も可能
    return;
  }

  isLoading.value = true;
  try {
    // API送信用のFormDataを作成 (PATCH/PUTを想定)
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('content', formData.content);
    // boolean値をAPIが期待する形式に変換（例: 'true'/'false'）
    payload.append('is_important', formData.is_important); 
    payload.append('status', formData.status);
    payload.append('published_at', formData.published_at);
    payload.append('related_url', formData.related_url);

    // ファイル処理: Fileオブジェクトならアップロード、nullなら削除、文字列なら変更なしとして送信
    if (formData.thumbnail_file instanceof File) {
      payload.append('thumbnail_file', formData.thumbnail_file);
    } else if (formData.thumbnail_file === null) {
      // API仕様に基づき、ファイル削除のフラグを送信
      payload.append('thumbnail_file_clear', 'true');
    }
    
    if (formData.sub_thumbnail_file instanceof File) {
      payload.append('sub_thumbnail_file', formData.sub_thumbnail_file);
    } else if (formData.sub_thumbnail_file === null) {
      payload.append('sub_thumbnail_file_clear', 'true');
    }
    
    // ★ 修正: 実際の API コール: PATCH /api/news/{id}
    await authApi.patch(`/api/news/${props.newsId}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    successMessage.value = 'お知らせが正常に更新されました。';
    alert(successMessage.value);
    
    // 成功後、お知らせ詳細画面へ遷移
    router.push(`/news/${props.newsId}`);

  } catch (err) {
    console.error('お知らせ更新エラー:', err);
    
    // バックエンドからのバリデーションエラー (400 Bad Request) を処理
    if (err.response && err.response.status === 400 && err.response.data) {
        // submitErrorを汎用エラーメッセージにする
        submitError.value = '入力内容を修正してください。';
        // フィールドごとのエラーをセット（APIレスポンス形式に依存）
        Object.keys(errors).forEach(key => errors[key] = ''); // errorsをリセット
        
        // APIレスポンスのフィールド名と Vue の formData のフィールド名を一致させていることを前提
        for (const key in err.response.data) {
            if (formData.hasOwnProperty(key)) {
                errors[key] = err.response.data[key][0]; // 最初のエラーメッセージを設定
            }
        }
    } else {
        submitError.value = `お知らせの更新に失敗しました。: ${err.response?.data?.detail || 'サーバーエラーを確認してください。'}`;
    }
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

.error-text-inline {
    color: #cc0000;
    font-size: 0.875rem;
    margin-top: 5px;
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