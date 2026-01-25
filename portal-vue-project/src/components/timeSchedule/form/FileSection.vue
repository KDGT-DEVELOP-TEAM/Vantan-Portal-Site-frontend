<template>
  <div class="form-row file-section file-section-align-left">
    <div class="file-input-group">
      <input
        type="file"
        id="attachedFile"
        ref="fileInput"
        @change="handleFileChange"
        :accept="allowedFileTypes"
        class="hidden-input"
      />

      <button
        type="button"
        class="custom-file-button"
        @click="triggerFileInput"
        :disabled="!!fileName"
      >
        {{ $t('file.select') }}
      </button>

      <span
        :class="['file-name-display', { 'is-placeholder': !fileName }]"
        :style="fileName ? 'border:none' : ''"
      >
        {{ fileName || $t('file.notSelected') }}
      </span>

      <!-- 削除ボタン: ファイル選択中だけ出現 -->
      <button
        v-if="fileName"
        type="button"
        class="delete-file-button"
        @click="deleteFile"
        :aria-label="$t('file.deleteAria')"
        :title="$t('file.deleteTitle')"
      >✕</button>
    </div>

    <!-- 親エラー or ローカルエラー -->
    <p v-if="error" class="error-text">{{ error }}</p>

    <p class="file-help">
      {{ helpText }}
    </p>
  </div>
</template>

<script>
  export default {
    name: 'FileSection',
    props: {
      // 親コンポーネントからエラーを受け取る
      fileError: {
        type: String,
        default: '',
      },
    },
    emits: ['file-selected'],
    data() {
      return {
        selectedFile: null,
        fileName: '',
        // serializers.py と同じ制限（UI誘導）
        allowedFileTypes: '.pdf',
        maxFileSizeMB: 10,

        // ローカル（このコンポーネント内）で発生するエラー
        localError: '',
      };
    },
    computed: {
      // 親から渡されたエラーを優先し、無ければローカルエラーを表示
      error() {
        return this.fileError || this.localError;
      },
      // i18n切替に追従させる
      helpText() {
        // 例: "PDFファイルのみ (最大10MB)"
        return this.$t('file.helpPdfMax', { max: this.maxFileSizeMB });
      },
    },
    methods: {
      triggerFileInput() {
        this.$refs.fileInput?.click?.();
      },

      handleFileChange(event) {
        const file = event?.target?.files?.[0];

        // 初期化
        this.localError = '';
        this.selectedFile = null;
        this.fileName = '';

        if (!file) {
          // 親にも null を伝える（未選択状態）
          this.$emit('file-selected', null);
          return;
        }

        // ===== 実装側のバリデーション（acceptだけに頼らない） =====
        // 1) 拡張子（最低限）
        const name = String(file.name || '');
        const isPdfByExt = name.toLowerCase().endsWith('.pdf');

        // 2) MIME（ブラウザによっては空のことがある）
        const type = String(file.type || '').toLowerCase();
        const isPdfByMime = !type ? true : type === 'application/pdf';

        if (!isPdfByExt || !isPdfByMime) {
          this.localError = this.$t('file.errorOnlyPdf');
          this._resetNativeInput();
          this.$emit('file-selected', null);
          return;
        }

        // 3) サイズ
        const maxBytes = this.maxFileSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          this.localError = this.$t('file.errorTooLarge', { max: this.maxFileSizeMB });
          this._resetNativeInput();
          this.$emit('file-selected', null);
          return;
        }

        // OK
        this.selectedFile = file;
        this.fileName = file.name;
        this.$emit('file-selected', file);
      },

      deleteFile() {
        this.selectedFile = null;
        this.fileName = '';
        this.localError = '';
        this._resetNativeInput();
        this.$emit('file-selected', null);
      },

      // 親コンポーネントから呼び出される
      resetFile() {
        this.selectedFile = null;
        this.fileName = '';
        this.localError = '';
        this._resetNativeInput();
        this.$emit('file-selected', null);
      },

      _resetNativeInput() {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
      },
    },
  };
</script>

<style scoped>
  /* ファイルセクションを左寄せ */
  .file-section-align-left {
    justify-content: flex-start !important;
    text-align: left !important;
  }

  /* 全体ファイルセクションラッパー: 親に合わせて幅を調整 */
  .file-section-wrap {
    max-width: 220px;
    flex: 1;
    min-width: 120px;
    margin-left: 0;
    margin-right: 0;
    display: flex;
    align-items: center;
  }

  /* ファイル入力の見た目をカード風(薄グレー)・ラウンド角で統一 */
  .file-input-group {
    display: flex;
    align-items: center;
    width: 100%;
    background: #fff;
    border-radius: 10px;
    min-height: 44px;
    border: none;
    box-shadow: none;
    padding: 0;
    gap: 0;
    justify-content: flex-start; /* 左寄せ */
  }

  /* 実際に見えない input[type="file"] */
  .hidden-input {
    display: none;
  }

  /* カスタムボタン (ファイル選択) - Addボタンと揃える */
  .custom-file-button {
    background: white;
    color: #2c2c2c;
    border-radius: 7px;
    padding: 14px 17px;
    border: none;
    font-size: 16px;
    font-weight: bold;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 5px;
    min-width: 90px;
    box-shadow: 0 1px 3px rgba(241, 73, 76, 0.04);
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid #ff9999;
  }

  .custom-file-button:hover:not(:disabled) {
    border: 1px solid #f1494c;
    background-color: #fff7f7;
    color: #2c2c2c;
    opacity: 0.95;
  }

  .custom-file-button:disabled {
    background: #575757;
    color: #fff;
    opacity: 0.75;
    cursor: not-allowed;
    border: 1px solid #bcbcbc;
  }

  /* ファイル名表示 */
  .file-name-display {
    flex: 1;
    padding: 2px 14px;
    border-radius: 7px;
    font-size: 15px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 44px;
    background: #fff;
    display: flex;
    align-items: center;
    margin-left: 0;
    box-shadow: 0 0 0 2px #eee inset;
    border: none;
  }
  .file-name-display.is-placeholder {
    color: #bbb;
    box-shadow: 0 0 0 2px #eee inset;
    border: none;
  }

  /* 削除ボタン */
  .delete-file-button {
    background: transparent;
    border: none;
    color: #f1494c;
    font-size: 1.4em;
    font-weight: bold;
    margin-left: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 5px;
    opacity: 0.8;
    transition: background 0.15s, color 0.15s, opacity 0.18s;
    align-self: center;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 0 2px #f1494c inset;
  }
  .delete-file-button:hover,
  .delete-file-button:focus {
    background: #ff3737;
    color: #ffffff;
    opacity: 1;
  }

  /* エラーメッセージ */
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

  /* 補足説明 */
  .file-help {
    color: #bbb;
    font-size: 0.85rem;
    margin-top: 5px;
    margin-bottom: 0;
    margin-left: 2px;
    white-space: nowrap;
  }
</style>