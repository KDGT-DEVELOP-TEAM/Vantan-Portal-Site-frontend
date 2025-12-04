<template>
  <div class="news-form-card">
    <form @submit.prevent="handleSubmit">
      
      <div class="form-group inline-label-group">
        <label for="title">見出し (タイトル) <span class="required">(必須)</span></label>
        <input id="title" type="text" v-model="formData.title" required placeholder="タイトルを入力してください">
      </div>

      <div class="form-group inline-label-group">
        <label for="content">内容 <span class="required">(必須)</span></label>
        <textarea id="content" v-model="formData.content" rows="8" placeholder="内容を入力してください"></textarea>
      </div>
      
      <div class="form-group inline-label-group">
        <label></label> <div class="input-area">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.importance"> 
            重要なお知らせ (任意)
          </label>
        </div>
      </div>

      <div class="form-group inline-label-group">
        <label for="file">添付ファイル (任意)</label>
        <div class="file-upload-area">
          <input 
            id="file" 
            type="file" 
            @change="handleFileChange" 
            accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.bmp"
            style="display: none;"
          >
          <label for="file" class="file-select-button">ファイル選択</label>
          <span class="file-name">{{ formData.attached_file ? formData.attached_file.name : 'ファイルが選択されていません' }}</span>
        </div>
      </div>

      <div class="button-group">
        <AddNewsSubmitButton :is-loading="isLoading" submit-label="追加" />
        <CancelButton />
      </div>

    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import AddNewsSubmitButton from './AddNewsSubmitButton.vue';
import CancelButton from '../CancelButton.vue'; // CancelButtonのパスは環境に合わせてください

// (スクリプト内容は省略 - 変更なし)
const props = defineProps({
  initialData: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit-data']);

const formData = reactive({ ...props.initialData });

const handleFileChange = (event) => {
  const file = event.target.files ? event.target.files[0] : null;
  formData.attached_file = file;
};

const handleSubmit = () => {
  if (!formData.title || !formData.content) {
    alert('見出し(タイトル)と本文は必須項目です。');
    return;
  }
  emit('submit-data', formData);
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

/* ★ フォームのラベルと入力フィールドを左右に分けるコンテナスタイル */
.inline-label-group {
  display: flex;
  margin-bottom: 25px;
}

.inline-label-group label {
  /* ラベルの固定幅 (スクリーンショットに合わせて調整) */
  flex-basis: 150px; 
  min-width: 150px;
  text-align: right;
  padding-right: 20px;
  font-weight: bold;
  color: #333;
}

.inline-label-group .input-area,
.inline-label-group input[type="text"], 
.inline-label-group textarea {
  /* 入力フィールドが残りのスペースを占める */
  flex-grow: 1;
  width: auto; /* flex-growが優先されるように */
}

/* 個別のフォーム要素のスタイル */
.form-group input[type="text"], 
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.required {
  color: #f15b5b;
  margin-left: 4px;
  font-size: 0.8rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  color: #333;
}

/* 添付ファイルエリアのスタイル */
.file-upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
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

.file-name {
  font-size: 0.9rem;
  color: #777;
}

/* ★ ボタンエリアのスタイル (スクリーンショットに合わせて左側に配置) */
.button-group {
  display: flex;
  justify-content: flex-start; /* 左寄せ */
  gap: 15px; /* ボタン間の間隔 */
  padding-top: 30px;
  margin-left: 170px; /* ラベルの幅分右にずらす (150px + 20px) */
}

</style>