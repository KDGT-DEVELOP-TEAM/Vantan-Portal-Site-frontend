<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container" role="dialog" aria-modal="true">
      <!-- header -->
      <div class="modal-header">
        <h2>{{ $t('user.bulk.title') }}</h2>
        <button class="close-button" type="button" @click="closeModal" :aria-label="$t('common.close')">
          ×
        </button>
      </div>

      <!-- tabs -->
      <div class="tab-menu">
        <button
          type="button"
          :class="{ active: mode === 'generate' }"
          @click="switchMode('generate')"
        >
          {{ $t('user.bulk.tabs.generate') }}
        </button>
        <button
          type="button"
          :class="{ active: mode === 'csv' }"
          @click="switchMode('csv')"
        >
          {{ $t('user.bulk.tabs.csv') }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <!-- modal-local error -->
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- ===== 連番 ===== -->
        <div v-if="mode === 'generate'">
          <div class="form-section">
            <label>
              {{ $t('user.bulk.generate.countLabel') }}
              <span class="required">{{ $t('common.required') }}</span>
            </label>
            <input
              type="number"
              v-model.number="form.count"
              min="1"
              required
              class="form-input"
              :disabled="isLoading"
            />
          </div>

          <div class="form-section email-base-section">
            <label>
              {{ $t('user.bulk.generate.emailLabel') }}
              <span class="required">{{ $t('common.required') }}</span>
            </label>

            <div class="email-inputs">
              <input
                class="form-input base-input"
                v-model.trim="form.base_email"
                required
                :disabled="isLoading"
              />
              <span class="separator">@</span>
              <input
                class="form-input domain-input"
                v-model.trim="form.domain"
                required
                :disabled="isLoading"
              />
            </div>

            <p class="email-preview">
              {{ emailPreviewText }}
            </p>
          </div>

          <div class="form-section">
            <label>
              {{ $t('user.bulk.generate.roleLabel') }}
              <span class="required">{{ $t('common.required') }}</span>
            </label>

            <select
              v-model="form.role"
              class="form-select select-dropdown grade-hover-select"
              :disabled="isLoading"
            >
              <option
                v-for="p in PERMISSIONS"
                :key="p.value"
                :value="p.value"
              >
                {{ p.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- ===== CSV ===== -->
        <div v-else>
          <div class="form-section">
            <label>
              {{ $t('user.bulk.csv.fileLabel') }}
              <span class="required">{{ $t('common.required') }}</span>
            </label>

            <div class="file-input-group">
              <input
                ref="csvInput"
                type="file"
                class="hidden-input"
                accept=".csv"
                @change="onFileChange"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="custom-file-button"
                @click="triggerCsvPick"
                :disabled="isLoading"
              >
                {{ $t('user.bulk.csv.pickFile') }}
              </button>

              <span
                class="file-name-display"
                :class="{ 'is-placeholder': !csvFileName }"
              >
                {{ csvFileName || $t('user.bulk.csv.noFileSelected') }}
              </span>

              <button
                v-if="csvFileName"
                type="button"
                class="delete-file-button"
                @click="clearCsv"
                :disabled="isLoading"
                :aria-label="$t('common.clear')"
              >
                ✕
              </button>
            </div>

            <div class="csv-help">
              <p><strong>{{ $t('user.bulk.csv.formatTitle') }}</strong></p>
              <code>{{ $t('user.bulk.csv.headerExample') }}</code>
              <p>{{ $t('user.bulk.csv.permissionHint') }}</p>
              <p class="csv-encoding-note">
                {{ $t('user.bulk.csv.encodingNote') }}
              </p>
            </div>

            <p v-if="csvError" class="csv-error">{{ csvError }}</p>

            <div v-if="csvRows.length" class="csv-preview-table">
              <p>
                {{ $t('user.bulk.csv.previewSummary', { valid: validCount, total: csvRows.length }) }}
              </p>

              <table>
                <thead>
                  <tr>
                    <th>email</th>
                    <th>user_name</th>
                    <th>permission</th>
                    <th>{{ $t('user.bulk.csv.status') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in csvRows" :key="i">
                    <td>{{ r.email }}</td>
                    <td>{{ r.user_name }}</td>
                    <td>{{ r.permission }}</td>
                    <td :class="r.valid ? 'ok' : 'ng'">
                      <span v-if="r.valid">{{ $t('common.ok') }}</span>
                      <span v-else>{{ r.error || $t('common.ng') }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- actions -->
        <div class="modal-actions">
          <button
            type="button"
            class="cancel-button"
            @click="closeModal"
            :disabled="isLoading"
          >
            {{ $t('common.cancel') }}
          </button>

          <button
            type="submit"
            class="submit-button"
            :disabled="submitDisabled"
          >
            {{ isLoading ? $t('common.submitting') : $t('common.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import { userApi } from '@/api/userManagementApi';

  export default {
    name: 'AddUsersLumpsumScreen',
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
    },

    emits: ['close', 'registered', 'error'],

    data() {
      return {
        mode: 'generate',
        isLoading: false,

        // テンプレ参照に合わせて定義
        error: null,     // string | null
        csvError: '',    // string

        form: {
          count: 10,
          base_email: 'user',
          domain: 'example.com',
          role: 'viewer',
        },

        csvFile: null,       // File | null
        csvFileName: '',
        csvRows: [],
        validCount: 0,
      };
    },

    computed: {
      /**
       * permission 定数（UI表示用）
       * 認可ロジックはここでは行わない
       */
      PERMISSIONS() {
        return [
          { label: this.$t('user.role.viewer'), value: 'viewer' },
          { label: this.$t('user.role.admin'), value: 'admin' },
        ];
      },

      emailPreviewText() {
        // user01〜{count}@{domain} のような表示（templateと同じ形式で文字列連結・0埋めは例表現のみ）
        const count = Number(this.form.count) || 0;
        const base = this.form.base_email || '';
        const domain = this.form.domain || '';
        // startは常に"01"固定
        return `${base}01〜${count}@${domain}`;
      },

      submitDisabled() {
        if (this.isLoading) return true;
        if (this.mode === 'csv') return !this.csvFile || this.validCount === 0;
        // generate
        return !this.form.count || this.form.count < 1 || !this.form.base_email || !this.form.domain || !this.form.role;
      },
    },

    methods: {
      switchMode(next) {
        if (this.isLoading) return;
        this.error = null;
        this.csvError = '';
        this.mode = next;
        // CSVモード→連番モードへ戻った時にcsv状態を残したくない場合
        // this.clearCsv();
      },

      closeModal() {
        this.reset();
        this.$emit('close');
      },

      reset() {
        this.mode = 'generate';
        this.isLoading = false;
        this.error = null;
        this.csvError = '';
        this.csvFile = null;
        this.csvFileName = '';
        this.csvRows = [];
        this.validCount = 0;
      },

      triggerCsvPick() {
        if (this.isLoading) return;
        if (this.$refs.csvInput) {
          this.$refs.csvInput.click();
        }
      },

      async handleSubmit() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.error = null;

        try {
          if (this.mode === 'generate') {
            // 連番作成
            await userApi.bulkGenerate({
              count: this.form.count,
              base_email: this.form.base_email,
              domain: this.form.domain,
              role: this.form.role,
            });
          } else {
            // CSVアップロード
            if (!this.csvFile || this.validCount === 0) {
              this.csvError = this.$t('user.bulk.csv.errors.noValidRows');
              return;
            }
            const fd = new FormData();
            fd.append('file', this.csvFile);
            await userApi.bulkUpload(fd);
          }

          this.$emit('registered');
          this.closeModal();
        } catch (e) {
          // modal 内で表示しない方針なら emit のみにしてもよいが、
          // 納期直前のUXとしては modal 内にも出しておく方が安全
          this.error = this.$t('user.bulk.errors.registerFailed');
          this.$emit('error', this.error);
        } finally {
          this.isLoading = false;
        }
      },

      onFileChange(e) {
        const file = e?.target?.files?.[0];
        if (!file) return;

        this.error = null;
        this.csvError = '';
        this.csvFile = file;
        this.csvFileName = file.name;

        // NOTE: 日本のCSVはShift-JISが混ざりがちだが、ここではUTF-8前提で読み込む
        const reader = new FileReader();
        reader.onload = () => this.parseCsv(String(reader.result || ''));
        reader.readAsText(file);
      },

      clearCsv() {
        this.csvFile = null;
        this.csvFileName = '';
        this.csvRows = [];
        this.validCount = 0;
        this.csvError = '';
        if (this.$refs.csvInput) {
          this.$refs.csvInput.value = '';
        }
      },

      parseCsv(text) {
        this.csvError = '';

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          this.csvRows = [];
          this.validCount = 0;
          this.csvError = this.$t('user.bulk.csv.errors.empty');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());

        const emailIdx = headers.indexOf('email');
        const nameIdx = headers.indexOf('user_name');
        const permIdx = headers.indexOf('permission');

        // ヘッダ検証（事故防止）
        if (emailIdx === -1 || nameIdx === -1 || permIdx === -1) {
          this.csvRows = [];
          this.validCount = 0;
          this.csvError = this.$t('user.bulk.csv.errors.invalidHeader');
          return;
        }

        const rows = [];
        let valid = 0;

        // email形式チェック用
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');

          const rawPermission = (cols[permIdx] ?? '').trim();
          const normalizedPermission = rawPermission.toLowerCase();

          const row = {
            email: (cols[emailIdx] ?? '').trim(),
            user_name: (cols[nameIdx] ?? '').trim(),
            permission: normalizedPermission,
            valid: true,
            error: '',
          };

          // ---- 簡易バリデーション（入力支援）----
          if (!row.email) {
            row.valid = false;
            row.error = this.$t('user.bulk.csv.errors.emailEmpty');
          } else if (!emailRegex.test(row.email)) {
            row.valid = false;
            row.error = this.$t('user.bulk.csv.errors.emailInvalid');
          } else if (!['viewer', 'admin'].includes(row.permission)) {
            row.valid = false;
            row.error = this.$t('user.bulk.csv.errors.permissionInvalid');
          }

          if (row.valid) valid++;
          rows.push(row);
        }

        this.csvRows = rows;
        this.validCount = valid;

        if (rows.length > 0 && valid === 0) {
          this.csvError = this.$t('user.bulk.csv.errors.noValidRows');
        }
      },
    },
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
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
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

  .form-input,
  .form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
  }

  /* select styling */
  .select-dropdown {
    width: 100%;
    min-width: 220px;
    max-width: 400px;
    padding: 10px 36px 10px 12px; 
    border: 1px solid #FF9999;
    border-radius: 4px;
    font-size: 1rem;
    background-color: white;
    appearance: none; /* デフォルトの矢印を非表示に */
    background-image:
      linear-gradient(to right, transparent 0 0),
      url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 20px center, right 8px center; /* 矢印を少し左へ・空白は矢印の左側に */
    background-size: 18px, 16px;
    position: relative;
    top: -2px;
  }

  .grade-hover-select:hover {
    background-color: #FFF7F7 !important;
    border: 1px solid #F1494C !important;
  }
  .grade-hover-select:hover,
  .grade-hover-select:focus {
    outline: none;
    background-color: white;
  }

  /* メール入力欄 */
  .email-base-section .email-inputs {
    display: flex;
    align-items: center;
  }
  .email-inputs .base-input {
    flex-grow: 1;
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    text-align: right;
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
  .cancel-button:hover:not(:disabled) {
    background-color: white;
    color: #555555;
    box-shadow: 0 0 0 2px #8D8D8D inset;
    font-weight: bold;
  }
  .cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #f1494c;
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
  .csv-encoding-note {
    margin-top: 6px;
    color: #666;
    font-size: 0.85em;
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
  .ok {
    color: green;
  }
  .ng {
    color: #dc3545;
  }

  /* --- ファイルUI --- */
  .file-input-group {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0;
    justify-content: flex-start;
  }
  .hidden-input {
    display: none;
  }
  .custom-file-button {
    display: flex;
    align-items: center;
    background: white;
    color: #2C2C2C;
    border-radius: 7px;
    padding: 7px 15px;
    font-size: 16px;
    font-weight: bold;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 5px;
    min-width: 90px;
    min-height: 42px;
    cursor: pointer;
    border: 1px solid #FF9999;
    justify-content: center;
  }
  .custom-file-button:hover:not(:disabled) {
    border: 1px solid #F1494C;
    background-color: #FFF7F7;
    opacity: 0.95;
  }
  .custom-file-button:disabled {
    background: #575757;
    color: #fff;
    opacity: 0.75;
    cursor: not-allowed;
    border: 1px solid #bcbcbc;
  }
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
    box-shadow: 0 0 0 2px #eee inset;
    border: none;
  }
  .file-name-display.is-placeholder {
    color: #bbb;
  }
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
    background: #F1494C;
    color: #ffffff;
    padding: 8px 12px;
    display: flex;
    justify-content: center;
    align-items: center;
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