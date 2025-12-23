<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>ユーザー一括登録</h2>
        <button type="button" class="close-button" @click="closeModal">×</button>
      </div>

      <div class="tab-menu">
        <button :class="{ active: mode === 'generate' }" @click="mode='generate'">連番で作成</button>
        <button :class="{ active: mode === 'csv' }" @click="mode='csv'">CSVから作成</button>
      </div>

      <form @submit.prevent="handleSubmit" class="bulk-register-form">
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- 連番モード -->
        <div v-if="mode === 'generate'">
          <div class="form-section">
            <label for="count">作成するユーザー数 <span class="required">(必須)</span></label>
            <input id="count" type="number" v-model.number="formData.count" required min="1" class="form-input" />
          </div>

          <div class="form-section email-base-section">
            <label for="base_email">メールアドレスのベース <span class="required">(必須)</span></label>
            <div class="email-inputs">
              <input id="base_email" type="text" v-model="formData.base_email" placeholder="例: user" required class="form-input base-input" />
              <span class="separator">@</span>
              <input type="text" v-model="formData.domain" placeholder="例: example.com" required class="form-input domain-input" />
            </div>
            <p class="email-preview">プレビュー: {{ formData.base_email || 'user' }}[01-{{ formData.count }}]@{{ formData.domain || 'example.com' }}</p>
          </div>

          <div class="form-section">
            <label for="role">ロール <span class="required">(必須)</span></label>
            <select id="role" v-model="formData.role" required class="form-select select-dropdown grade-hover-select">
              <option value="viewer">保護者</option>
              <option value="admin">管理者</option>
            </select>
          </div>
        </div>

        <!-- CSVモード -->
        <div v-else>
          <div class="form-section">
            <label>CSVファイルを選択 <span class="required">(必須)</span></label>
            <div class="file-input-group">
              <input
                type="file"
                ref="csvFileInput"
                accept=".csv,text/csv"
                class="hidden-input"
                @change="handleFileChange"
                id="csv-upload"
                :disabled="!!csvFileName"
              />

              <label
                for="csv-upload"
                class="custom-file-button"
                :class="{ disabled: !!csvFileName }"
                :style="csvFileName ? 'pointer-events:none' : ''"
              >
                ファイル選択
              </label>

              <span
              :class="['file-name-display', { 'is-placeholder': !csvFileName }]"
              :style="csvFileName ? 'border:none' : ''"
              >
              {{ csvFileName || 'ファイルが選択されていません' }}
              </span>

              <button
              v-if="csvFileName"
              type="button"
              class="delete-file-button"
              @click="deleteCsvFile"
              title="選択したファイルを削除"
              >
              ✕
              </button>
            </div>
            <div class="csv-help">
              <p><strong>CSVフォーマット（ヘッダ必須）</strong></p>
              <code>email,user_name,role</code>
              <p>※ role は <code>viewer</code> / <code>admin</code></p>
              <button type="button" class="csv-sample-btn" @click="downloadSample">
                サンプルCSVをダウンロード
              </button>
            </div>

            <p v-if="csvError" class="csv-error">{{ csvError }}</p>

            <!-- プレビュー -->
            <div v-if="csvRows.length" class="csv-preview-table">
              <p>プレビュー (全 {{ csvRows.length }} 件) / 登録可能: {{ validRowCount }} 件</p>
              <table>
                <thead>
                  <tr>
                    <th>email</th>
                    <th>user_name</th>
                    <th>role</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in csvRows" :key="i">
                    <td>{{ row.email }}</td>
                    <td>{{ row.user_name }}</td>
                    <td>{{ row.role }}</td>
                    <td :class="{ ok: row.valid, ng: !row.valid }">
                      {{ row.valid ? 'OK' : row.error }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button
            type="button"
            class="cancel-button"
            @click="closeModal"
          >
            キャンセル
          </button>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading || (mode === 'csv' && validRowCount === 0)"
          >
            {{ isLoading ? '登録中...' : '登録する' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/api/userManagementApi';

export default {
  name: 'BulkRegisterModal',
  props: {
    isVisible: { type: Boolean, required: true }
  },
  emits: ['close', 'registered'],
  data() {
    return {
      mode: 'generate', // or 'csv'
      formData: {
        count: 10,
        base_email: 'user',
        domain: 'example.com',
        role: 'viewer'
      },
      csvFile: null,
      csvPreview: null,
      isLoading: false,
      error: null,
      csvRows: [],
      csvError: null,
      validRowCount: 0,
      csvFileName: '',
    };
  },
  methods: {
    closeModal() {
      this.resetForm();
      this.$emit('close');
    },
    resetForm() {
      this.mode = 'generate';
      this.formData = { count: 10, base_email: 'user', domain: 'example.com', role: 'viewer' };
      this.csvFile = null;
      this.csvFileName = '';
      this.csvPreview = null;
      this.csvRows = [];
      this.csvError = null;
      this.validRowCount = 0;
      this.isLoading = false;
      this.error = null;
    },
    handleFileChange(e) {
      const f = e.target.files[0];
      this.csvFile = f || null;
      this.csvFileName = f ? f.name : '';

      if (!f) {
        this.csvPreview = null;
        this.resetCsvState();
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        this.parseCsv(text);
      };
      reader.readAsText(f);
    },
    deleteCsvFile() {
      this.csvFile = null;
      this.csvFileName = '';
      this.csvPreview = null;
      this.resetCsvState();

      if (this.$refs.csvFileInput) {
        this.$refs.csvFileInput.value = '';
      }
    },

    async handleSubmit() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.error = null;

      try {
        if (this.mode === 'csv') {
          if (!this.csvFile || this.validRowCount === 0) {
            this.error = '登録可能なCSVデータがありません';
            return;
          }

          const fd = new FormData();
          fd.append('file', this.csvFile);

          await userApi.bulkUpload(fd);
        } else {
          await userApi.bulkGenerate(this.formData);
        }

        this.$emit('registered');
        this.closeModal();
      }  catch (e) {
        this.error =
          e.response?.data?.detail ||
          e.response?.data?.message ||
          '一括登録に失敗しました';
      } finally {
        this.isLoading = false;
      }
    },

    resetCsvState() {
      this.csvRows = [];
      this.csvError = null;
      this.validRowCount = 0;
    },

    parseCsv(text) {
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        this.csvError = 'CSVにデータ行がありません';
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      if (!headers.includes('email')) {
        this.csvError = 'email カラムが存在しません';
        return;
      }

      const rows = [];
      let validCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const row = {
          email: cols[headers.indexOf('email')]?.trim() || '',
          user_name: cols[headers.indexOf('user_name')]?.trim() || '',
          role: cols[headers.indexOf('role')]?.trim() || 'viewer',
          valid: true,
          error: ''
        };

        // 検証
        if (!this.isValidEmail(row.email)) {
          row.valid = false;
          row.error = 'メール形式エラー';
        } else if (!['viewer', 'admin'].includes(row.role)) {
          row.valid = false;
          row.error = 'role不正';
        }

        if (row.valid) validCount++;
        rows.push(row);
      }

      this.csvRows = rows;
      this.validRowCount = validCount;
    },

    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    downloadSample() {
      const content =
      `email,user_name,role
      test1@example.com,山田太郎,viewer
      test2@example.com,佐藤花子,admin
      `;
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_bulk_sample.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
  }
};
</script>
  
  <style scoped>
  /* --- モーダルコンテナ --- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明の背景 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 最前面に表示 */
  }
  
  .modal-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  /* --- ヘッダー --- */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5em;
    color: #F1494C;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 2em;
    cursor: pointer;
    color: #aaa;
    line-height: 0.5;
  }
  
  
  .close-button:hover {
    color: #333;
  }
  .tab-menu button {
    padding: 8px 18px;
    background: #f7f7f7;
    border: 1px solid #eee;
    border-bottom: none;
    color: #333;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    margin-right: 4px;
    margin-bottom: -1px;
    transition: background 0.15s, color 0.15s;
  }
  .tab-menu button.active {
    background: #fff;
    color: #f1494c;
    border-bottom: 2px solid #f1494c;
    z-index: 1;
  }
  .tab-menu button:not(.active):hover {
    background: #fbeaea;
    color: #c93d40;
  }
  .tab-menu {
    display: flex;
    margin-bottom: 24px;
    border-bottom: 1.5px solid #eee;
  }
  /* --- フォーム --- */
  .form-section {
    margin-bottom: 20px;
    text-align: left;
  }

  .form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
    /* ドロップダウンの見た目を整えるための調整 */
    height: 40px; 
    appearance: none; /* デフォルトの矢印を非表示にする場合 */
  }
  
  .form-actions {
    margin-top: 30px;
  }
  
  .header-actions {
    display: flex;
    justify-content: flex-end; /* 右端に配置 */
    margin-bottom: 20px;
  }

  .bulk-register-button {
    padding: 8px 15px;
    background-color: #f1494c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  .bulk-register-button:hover {
    background-color: #c93d40;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }
  
  .required {
    color: #dc3545;
    margin-left: 4px;
  }
  
  .form-input, .form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
  }

  .select-dropdown {
    width: 20%;
    padding: 8px 10px;
    border: 1px solid #FF9999;
    border-radius: 4px;
    font-size: 1rem;
    background-color: white;
    appearance: none; /* デフォルトの矢印を非表示に */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    position: relative;
    top: -2px;
  }
  .grade-hover-select:hover {
    background-color: #FFF7F7 !important;
    border: 1px solid #F1494C !important;
  }
  .grade-hover-select:hover, .grade-hover-select:focus {
    /* フォーカス時のアウトラインを消す*/
    outline: none;
  }
  
  /* メールベース入力欄のレイアウト */
  .email-base-section .email-inputs {
    display: flex;
    align-items: center;
  }
  
  .email-inputs .base-input {
    flex-grow: 1;
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    text-align: right; /* ベース部分を右寄せ */
  }
  
  .email-inputs .separator {
    padding: 10px 5px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-left: none;
    border-right: none;
    color: #555;
    font-weight: bold;
  }
  
  .email-inputs .domain-input {
    flex-grow: 2;
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  .email-preview {
    margin-top: 5px;
    font-size: 0.85em;
    color: #007bff;
    text-align: right;
    padding-right: 5px;
  }
  
  /* --- アクション --- */
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }
  
  .cancel-button {
    padding: 10px 20px;
    border: 1px solid #8D8D8D;
    border-radius: 4px;
    background-color: #8D8D8D;
    color: white;
    cursor: pointer;
  }
  .cancel-button:hover {
    background-color: white;
    color: #555555; /* 薄いグレーで色反転 */
    box-shadow: 0 0 0 2px #8D8D8D inset; /* 内側にボーダー */
    font-weight: bold;
  }
  
  .submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #f1494c; /* メインカラー */
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #c93d40;
  }
  
  .submit-button:disabled {
    background-color: #f9d3d3;
    cursor: not-allowed;
  }
  
  /* --- CSV --- */
  .csv-help {
    background: #f9f9f9;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.9em;
  }
  .csv-sample-btn {
    margin-top: 6px;
    background: none;
    border: none;
    color: #f1494c;
    font-weight: bold;
    cursor: pointer;
  }
  .csv-error {
    color: #dc3545;
    margin-top: 8px;
  }
  .csv-preview-table {
    margin-top: 10px;
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  .csv-preview-table th,
  .csv-preview-table td {
    border: 1px solid #ddd;
    padding: 6px;
    font-size: 0.85em;
  }
  .ok { color: green; }
  .ng { color: #dc3545; }
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
    min-height: 38px;
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
  .custom-file-button.disabled {
    background: #575757;
    color: #fff;
    opacity: 0.75;
    cursor: not-allowed;
    border: 1px solid #bcbcbc;
  }
  .custom-file-button.disabled:hover {
    background: #575757;
    color: #fff;
    border: 1px solid #bcbcbc;
  }
  /* カスタムボタン (ファイル選択) - Addボタンと揃える */
  .custom-file-button {
    margin-top: 7px;
    background: white;
    color: #2C2C2C;
    border-radius: 7px;
    padding: 8px 15px;
    border: none;
    font-size: 16px;
    font-weight: bold;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 5px;
    min-width: 90px;
    box-shadow: 0 1px 3px rgba(241,73,76,0.04);
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid #FF9999; /* やや淡い赤のボーダー */
  }
  .custom-file-button:hover:not(:disabled) {
    border: 1px solid #F1494C;
    background-color: #FFF7F7;
    color: #2C2C2C;
    opacity: 0.95;
  }
  .custom-file-button:disabled {
    background: #575757;
    color: #fff;
    opacity: 0.75;
    cursor: not-allowed;
    border: 1px solid #bcbcbc;
  }
  /* ファイル名表示: ボタンの横, 白背景, グレー枠, プレースホルダー時は薄グレー */
  .file-name-display {
    flex: 1;
    padding: 2px 14px;
    border-radius: 7px;
    font-size: 15px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 38px;
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
  /* 削除ボタン:ファイル名の右に小さく表示 */
  .delete-file-button {
    background: transparent;
    border: none;
    color: #F1494C;
    font-size: 1.4em;
    font-weight: bold;
    margin-left: 8px;
    cursor: pointer;
    outline: none;
    padding: 8px 12px;
    border-radius: 5px;
    opacity: 0.8;
    transition: background 0.15s, color 0.15s, opacity 0.18s;
    align-self: center;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 0 2px #F1494C inset;
    outline: none;
    text-align: center;
  }
  .delete-file-button:hover,
  .delete-file-button:focus {
    background: #ff3737;
    color: #ffffff;
    opacity: 1;
    padding: 8px 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /* エラーメッセージ: 赤, フォーム全体のerror-textデザインにあわせる */
  .error-text {
    color: #F1494C;
    font-size: 0.92em;
    margin-left: 12px;
    margin-top: 5px;
    margin-bottom: 0;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
  }
  /* 補足説明: グレー, 小さめフォント */
  .file-help {
    color: #bbb;
    font-size: 0.85rem;
    margin-top: 5px;
    margin-bottom: 0;
    margin-left: 2px;
    white-space: nowrap;
  }

  /* --- エラー表示 --- */
  .error-message {
    padding: 10px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin-bottom: 15px;
    text-align: center;
  }
  </style>