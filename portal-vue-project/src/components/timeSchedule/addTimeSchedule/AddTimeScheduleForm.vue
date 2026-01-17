<template>
  <form @submit.prevent="handleSubmit" class="add-time-schedule-form">
    <div class="form-block">
      <div class="form-row align-label">
        <label class="form-label required" for="grade">学年</label>
        <div class="grade-select-block">
          <select id="grade" v-model.number="formData.grade" class="form-select" required>
            <!-- <option value="" disabled>選択してください</option> -->
            <option v-for="n in 5" :key="n" :value="n">{{ n }}年生</option>
          </select>
        </div>
        <span v-if="validationErrors.grade" class="error-text">{{ validationErrors.grade }}</span>
      </div>

      <div class="form-row align-label">
        <label class="form-label required" for="title">タイトル</label>
        <input
          type="text"
          id="title"
          v-model.trim="formData.title"
          class="form-input"
          placeholder="タイトルを入力してください"
          maxlength="255"
          required
        />
        <span v-if="validationErrors.title" class="error-text">{{ validationErrors.title }}</span>
      </div>

      <div class="form-row align-label">
        <label class="form-label required" for="image_file">添付ファイル</label>
        <div class="file-section-wrap">
          <FileSection 
            @file-selected="handleFileSelected"
            :file-error="validationErrors.image_file"
            ref="fileSection"
          />
        </div>
      </div>
    </div>

    <div class="action-buttons-row">
      <button type="submit" :disabled="isSubmitting" class="submit-btn add-btn">
        {{ isSubmitting ? '追加中...' : '追加' }}
      </button>
      <button type="button" class="cancel-btn" @click="$emit('cancel')">
        キャンセル
      </button>
    </div>

    <p v-if="apiError" class="api-error-text">{{ apiError }}</p>
  </form>
</template>

<script>
  import FileSection from '../form/FileSection.vue';
  import { createTimeScheduleApi } from '@/api/timetable';
  import { hasPermission } from '@/utils/permission';
  
  const initialFormData = () => ({
    grade: 1,
    title: '',
    content: '',
    image_file: null,
  });
  
  export default {
    name: 'AddTimeScheduleForm',
    components: {
      FileSection,
    },
    emits: ['success', 'cancel'],
    data() {
      return {
        formData: initialFormData(),
        isSubmitting: false,
        apiError: null,
        validationErrors: {},
      };
    },
    methods: {
      handleFileSelected(file) {
        this.formData.image_file = file;
        if (this.validationErrors.image_file) {
          delete this.validationErrors.image_file;
          this.validationErrors = { ...this.validationErrors };
        }
      },
  
      async handleSubmit() {
        // 権限チェックを追加
        if (!hasPermission('timeschedule_manage')) {
          this.apiError = '権限がありません。操作できません。';
          return;
        }
  
        // バリデーション
        if (!this.formData.grade || !this.formData.title || !this.formData.image_file) {
          this.apiError = '必須項目が未入力です。';
          return;
        }
  
        this.isSubmitting = true;
        this.apiError = null;
        this.validationErrors = {};
  
        const formPayload = new FormData();
        formPayload.append('grade', this.formData.grade);
        formPayload.append('title', this.formData.title);
        if (this.formData.content) {
          formPayload.append('content', this.formData.content);
        }
        formPayload.append('image_file', this.formData.image_file);
  
        try {
          await createTimeScheduleApi(formPayload);
  
          this.resetForm();
          this.$emit('success');
        } catch (err) {
          this.apiError = '時間割の作成中にエラーが発生しました。';
          console.error('時間割作成エラー:', err.response || err);
  
          if (err.response && err.response.data) {
            const data = err.response.data;
            let newErrors = {};
  
            if (typeof data === 'object') {
              Object.keys(data).forEach((key) => {
                if (Array.isArray(data[key]) && typeof data[key][0] === 'string') {
                  newErrors[key] = data[key][0];
                }
              });
              this.validationErrors = newErrors;
  
              if (Object.keys(newErrors).length === 0) {
                this.apiError = data.detail || JSON.stringify(data);
              } else {
                this.apiError = null;
              }
            } else if (typeof data === 'string') {
              this.apiError = data;
            }
          }
        } finally {
          this.isSubmitting = false;
        }
      },
  
      resetForm() {
        this.formData = initialFormData();
        this.validationErrors = {};
        this.apiError = null;
        this.$refs.fileSection.resetFile();
      },
    },
  };
</script>  

<style scoped>
  /* 全体のフォームの余白・まとめ */
  .add-time-schedule-form {
    background: #fff;
    border-radius: 10px;
    max-width: 1080px;
    min-width: 640px;
    margin: 0 auto;
    padding: 0;
    border: none;
    box-shadow: none;
    width: 100%;
  }

  /* フォームブロック: 横長カード化 */
  .form-block {
    background: #fff;
    border-radius: 10px;
    box-shadow: none;
    width: 100%;
    margin-bottom: 10px;
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 18px 0;
  }

  /* 横長・縦並びのラベル位置調整 */
  .form-row.align-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0;
    position: relative;
    width: 100%;
    max-width: 1080px;
  }

  .form-row.align-label:not(:last-child) {
    margin-bottom: 20px;
  }

  /* ラベルデザイン */
  .form-label {
    display: block;
    width: 110px;
    min-width: 110px;
    font-size: 15px;
    font-weight: normal;
    color: #2c2c2c;
    margin-right: 18px;
    text-align: left;
    background: none;
    margin-bottom: 0;
    line-height: 1.4;
    position: relative;
    white-space: nowrap;
  }

  /* 必須表現（赤文字） */
  .form-label.required::after {
    content: '（必須）';
    color: #F1494C;
    font-weight: normal;
    font-size: 0.95em;
    margin-left: 7px;
  }

  /* 学年セレクトのラッパー: ラベル横にコンパクトに */
  .grade-select-block {
    width: 65px;
    min-width: 65px;
    margin-right: 0;
  }

  /* ドロップダウン自体 */
  .form-select {
    width: 65px;
    padding: 7px 5px 7px 8px;
    border-radius: 5px;
    font-size: 16px;
    border: 1px solid #ddd;
    color: #2c2c2c;
    appearance: none;
    background: #fff;
    line-height: 1.2;
    outline: none;
    margin-right: 0;
  }

  .form-select:focus {
    border-color: #FF9999;
  }

  .form-input {
    flex: 1;
    min-width: 140px;
    max-width: 1080px;
    padding: 10px 10px;
    border-radius: 7px;
    font-size: 15px;
    border: 1px solid #ddd;
    background: #fff;
    color: #333;
    outline: none;
    margin-right: 0;
  }

  .form-input:focus {
    border-color: #FF9999;
  }

  /* ファイルセクション */
  .file-section-wrap {
    max-width: 1080px;
    flex: 1;
    min-width: 120px;
    margin-left: auto;
    margin-right: 0;
    margin-top: 26px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  /* テキストエリア */
  .form-textarea {
    flex: 1;
    min-width: 120px;
    max-width: 1080px;
    min-height: 36px;
    font-size: 15px;
    border-radius: 7px;
    border: 1px solid #ddd;
    background: #fff;
    padding: 8px 10px;
    color: #333;
    outline: none;
    resize: vertical;
    margin-right: 0;
  }

  .form-textarea:focus {
    border-color: #F1494C;
  }

  /* バリデーションエラー横に */
  .error-text {
    color: #F1494C;
    font-size: 0.92em;
    margin-left: 12px;
    margin-top: 0;
    margin-bottom: 0;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
  }

  /* ボタン部: 左端そろえ, 横並び, 下部 */
  .action-buttons-row {
    display: flex;
    flex-direction: row;
    gap: 20px;
    margin-top: 34px;
    margin-bottom: 0;
    justify-content: flex-start;
    align-items: center;
  }

  /* 追加ボタン */
  .add-btn {
    background: #F1494C;
    color: #fff;
    font-weight: bold;
    border-radius: 7px;
    padding: 15px 18px;
    border: none;
    font-size: 16px;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 7px;
    min-width: 90px;
    box-shadow: 0 1px 3px rgba(241,73,76,0.04);
  }

  .add-btn:hover:not(:disabled) {
    background: white;
    color: #F1494C;
    opacity: 0.95;
    /* 内側ボーダーにする */
    box-shadow: 0 0 0 2px #F1494C inset;
    border: none;
    box-sizing: border-box;
  }

  .add-btn:disabled {
    background: #ddd;
    color: #fff;
    opacity: 0.75;
    cursor: not-allowed;
  }

  /* キャンセルボタン */
  .cancel-btn {
    background: #888;
    color: #fff;
    font-weight: bold;
    border-radius: 7px;
    padding: 15px 18px;
    border: none;
    font-size: 16px;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 7px;
    min-width: 90px;
    box-shadow: 0 1px 3px rgba(90, 88, 88, 0.04);
  }

  .cancel-btn:hover {
    background-color: white;
    color: #444;
    box-shadow: 0 0 0 2px #888 inset;
  }

  .api-error-text {
    color: #F1494C;
    font-size: 1rem;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 0;
    text-align: left;
    background: transparent;
    border: none;
    padding: 0 0 0 3px;
    border-radius: 0;
  }

  /* ---------- レスポンシブ ---------- */

  @media (max-width: 820px) {
    .add-time-schedule-form {
      padding: 0 7px;
      min-width: 0;
      max-width: 100vw;
      text-align: left;
    }
    .form-block {
      padding: 20px 0 18px 0;
      text-align: left;
    }
    .form-row.align-label {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      max-width: 100vw;
      margin-bottom: 7px;
      gap: 4px 0;
      text-align: left;
    }
    .form-label {
      width: 100%;
      min-width: unset;
      margin-bottom: 3px;
      margin-right: 0;
      font-size: 15px;
      text-align: left;
    }
    .grade-select-block {
      width: 100%;
      min-width: unset;
      margin-top: 0;
      text-align: left;
    }
    .form-select {
      width: 100%;
      max-width: 110px;
      text-align: left;
    }
    .form-input,
    .form-textarea {
      min-width: 0;
      max-width: 360px;
      width: 100%;
      text-align: left;
    }
    .file-section-wrap {
      max-width: 360px;
      width: 100%;
      text-align: left;
      justify-content: flex-start;
      align-items: flex-start;
      margin-left: 0;
      margin-right: auto;
    }
    .action-buttons-row {
      flex-direction: row;
      justify-content: flex-start;
      gap: 13px;
      margin-top: 38px;
      margin-bottom: 10px;
      text-align: left;
    }
  }
</style>