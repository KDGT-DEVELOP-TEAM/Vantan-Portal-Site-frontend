<template>
  <form @submit.prevent="handleSubmit" class="add-time-schedule-form">
    <div class="form-block">
      <div class="form-row align-label">
        <label class="form-label required" for="grade">
          {{ $t('timeschedule.grade') }}
        </label>

        <div class="grade-select-block">
          <select
            id="grade"
            v-model.number="formData.grade"
            class="form-select"
            required
          >
            <option v-for="n in 5" :key="n" :value="n">
              {{ n }}{{ $t('timeschedule.gradeSuffix') }}
            </option>
          </select>
        </div>

        <span v-if="validationErrors.grade" class="error-text">
          {{ validationErrors.grade }}
        </span>
      </div>

      <div class="form-row align-label">
        <label class="form-label required" for="title">
          {{ $t('timeschedule.title') }}
        </label>

        <input
          type="text"
          id="title"
          v-model.trim="formData.title"
          class="form-input"
          :placeholder="$t('timeschedule.titlePlaceholder')"
          maxlength="255"
          required
        />

        <span v-if="validationErrors.title" class="error-text">
          {{ validationErrors.title }}
        </span>
      </div>

      <div class="form-row align-label">
        <label class="form-label required" for="image_file">
          {{ $t('timeschedule.attachment') }}
        </label>

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
        {{ isSubmitting ? $t('common.adding') : $t('common.add') }}
      </button>

      <button type="button" class="cancel-btn" @click="$emit('cancel')">
        {{ $t('common.cancel') }}
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
          // Vueが検知できるように参照を更新
          this.validationErrors = { ...this.validationErrors };
        }
      },

      async handleSubmit() {
        // 権限チェック（ルートガードの保険）
        if (!hasPermission('timeschedule_manage')) {
          this.apiError = this.$t('timeschedule.errors.noPermission');
          return;
        }

        // 最低限の必須チェック（ブラウザrequired + 保険）
        if (!this.formData.grade || !this.formData.title || !this.formData.image_file) {
          this.apiError = this.$t('timeschedule.errors.requiredMissing');
          return;
        }

        this.isSubmitting = true;
        this.apiError = null;
        this.validationErrors = {};

        const formPayload = new FormData();
        formPayload.append('grade', String(this.formData.grade)); // 念のため文字列化
        formPayload.append('title', this.formData.title);

        formPayload.append('image_file', this.formData.image_file);

        try {
          await createTimeScheduleApi(formPayload);

          this.resetForm();
          this.$emit('success');
        } catch (err) {
          console.error('時間割作成エラー:', err?.response || err);

          // まずは汎用メッセージ
          this.apiError = this.$t('timeschedule.errors.createFailed');

          // DRFのバリデーションエラーをフィールドに反映
          const res = err?.response;
          const data = res?.data;

          if (data) {
            if (typeof data === 'object') {
              const newErrors = {};

              Object.keys(data).forEach((key) => {
                if (Array.isArray(data[key]) && typeof data[key][0] === 'string') {
                  newErrors[key] = data[key][0];
                }
              });

              this.validationErrors = newErrors;

              // フィールドエラーが取れた場合は、上の汎用apiErrorは消す（UIのノイズ削減）
              if (Object.keys(newErrors).length > 0) {
                this.apiError = null;
              } else {
                // detailがあればそれを表示
                this.apiError = data.detail ? String(data.detail) : JSON.stringify(data);
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

        // FileSectionが提供していればリセット
        this.$refs.fileSection?.resetFile?.();
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
    border-color: #ff9999;
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
    border-color: #ff9999;
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

  /* テキストエリア（将来使う想定のまま残置） */
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
    border-color: #f1494c;
  }

  /* バリデーションエラー横に */
  .error-text {
    color: #f1494c;
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
    background: #f1494c;
    color: #fff;
    font-weight: bold;
    border-radius: 7px;
    padding: 15px 18px;
    border: none;
    font-size: 16px;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 7px;
    min-width: 90px;
    box-shadow: 0 1px 3px rgba(241, 73, 76, 0.04);
  }

  .add-btn:hover:not(:disabled) {
    background: white;
    color: #f1494c;
    opacity: 0.95;
    box-shadow: 0 0 0 2px #f1494c inset;
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
    color: #f1494c;
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