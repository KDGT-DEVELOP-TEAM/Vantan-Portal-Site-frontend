<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- header -->
      <div class="modal-header">
        <h2>ユーザー一括登録</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <!-- tabs -->
      <div class="tab-menu">
        <button
          :class="{ active: mode === 'generate' }"
          @click="mode = 'generate'"
        >
          連番で作成
        </button>
        <button
          :class="{ active: mode === 'csv' }"
          @click="mode = 'csv'"
        >
          CSVから作成
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- ===== 連番 ===== -->
        <div v-if="mode === 'generate'">
          <div class="form-section">
            <label>作成するユーザー数 <span class="required">(必須)</span></label>
            <input
              type="number"
              v-model.number="form.count"
              min="1"
              required
              class="form-input"
            />
          </div>

          <div class="form-section email-base-section">
            <label>メールアドレス <span class="required">(必須)</span></label>
            <div class="email-inputs">
              <input
                class="form-input base-input"
                v-model="form.base_email"
                required
              />
              <span class="separator">@</span>
              <input
                class="form-input domain-input"
                v-model="form.domain"
                required
              />
            </div>
            <p class="email-preview">
              {{ form.base_email }}01〜{{ form.count }}@{{ form.domain }}
            </p>
          </div>

          <div class="form-section">
            <label>権限 <span class="required">(必須)</span></label>
            <select
              v-model="form.role"
              class="form-select select-dropdown grade-hover-select"
            >
              <option value="viewer">保護者</option>
              <option value="admin">管理者</option>
            </select>
          </div>
        </div>

        <!-- ===== CSV ===== -->
        <div v-else>
          <div class="form-section">
            <label>CSVファイル <span class="required">(必須)</span></label>

            <div class="file-input-group">
              <input
                ref="csvInput"
                type="file"
                class="hidden-input"
                accept=".csv"
                @change="onFileChange"
              />
              <button
                type="button"
                class="custom-file-button"
                @click="$refs.csvInput.click()"
              >
                ファイル選択
              </button>
              <span
                class="file-name-display"
                :class="{ 'is-placeholder': !csvFileName }"
              >
                {{ csvFileName || 'ファイルが選択されていません' }}
              </span>
              <button
                v-if="csvFileName"
                type="button"
                class="delete-file-button"
                @click="clearCsv"
              >
                ✕
              </button>
            </div>

            <div class="csv-help">
              <p><strong>CSVフォーマット（ヘッダ必須）</strong></p>
              <code>email,user_name,permission</code>
              <p>permission：viewer / admin</p>
            </div>

            <p v-if="csvError" class="csv-error">{{ csvError }}</p>

            <div v-if="csvRows.length" class="csv-preview-table">
              <p>
                登録可能 {{ validCount }} / {{ csvRows.length }}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>email</th>
                    <th>user_name</th>
                    <th>permission</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in csvRows" :key="i">
                    <td>{{ r.email }}</td>
                    <td>{{ r.user_name }}</td>
                    <td>{{ r.permission }}</td>
                    <td :class="r.valid ? 'ok' : 'ng'">
                      <span v-if="r.valid">OK</span>
                      <span v-else>{{ r.error || 'NG' }}</span>
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
          >
            キャンセル
          </button>

          <button
            type="submit"
            class="submit-button"
            :disabled="
              isLoading ||
              (mode === 'csv' && (!csvFile || validCount === 0))
            "
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
  
  /**
   * permission 定数（UI表示用）
   * 認可ロジックはここでは行わない
   */
  const PERMISSIONS = [
    { label: '保護者', value: 'viewer' },
    { label: '管理者', value: 'admin' },
  ];
  
  export default {
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
    },
  
    emits: ['close', 'registered', 'error'],
  
    data() {
      return {
        PERMISSIONS,
        mode: 'generate',
        isLoading: false,
  
        form: {
          count: 10,
          base_email: 'user',
          domain: 'example.com',
          role: 'viewer',
        },
  
        csvFile: null,
        csvFileName: '',
        csvRows: [],
        validCount: 0,
      };
    },
  
    methods: {
      closeModal() {
        this.reset();
        this.$emit('close');
      },
  
      reset() {
        this.mode = 'generate';
        this.isLoading = false;
        this.csvFile = null;
        this.csvFileName = '';
        this.csvRows = [];
        this.validCount = 0;
      },
  
      async handleSubmit() {
        if (this.isLoading) return;
  
        this.isLoading = true;
        try {
          if (this.mode === 'generate') {
            await userApi.bulkGenerate(this.form);
          } else {
            const fd = new FormData();
            fd.append('file', this.csvFile);
            await userApi.bulkUpload(fd);
          }
  
          this.$emit('registered');
          this.closeModal();
        } catch (e) {
          // ← modal 内で表示しない。親に任せる
          this.$emit('error', 'ユーザー登録に失敗しました');
        } finally {
          this.isLoading = false;
        }
      },
  
      onFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
  
        this.csvFile = file;
        this.csvFileName = file.name;
  
        const reader = new FileReader();
        reader.onload = () => this.parseCsv(reader.result);
        reader.readAsText(file);
      },
  
      clearCsv() {
        this.csvFile = null;
        this.csvFileName = '';
        this.csvRows = [];
        this.validCount = 0;
        if (this.$refs.csvInput) {
          this.$refs.csvInput.value = '';
        }
      },
  
      parseCsv(text) {
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) {
          this.csvRows = [];
          this.validCount = 0;
          return;
        }

        const headers = lines[0].split(',');

        const emailIdx = headers.indexOf('email');
        const nameIdx = headers.indexOf('user_name');
        const permIdx = headers.indexOf('permission');

        const rows = [];
        let valid = 0;

        // email形式チェック用
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');

          const rawPermission = cols[permIdx]?.trim() || '';
          const normalizedPermission = rawPermission.toLowerCase();

          const row = {
            email: cols[emailIdx]?.trim() || '',
            user_name: cols[nameIdx]?.trim() || '',
            permission: normalizedPermission,
            valid: true,
            error: '',
          };

          // ---- バリデーション ----
          if (!row.email) {
            row.valid = false;
            row.error = 'emailが空です';

          } else if (!emailRegex.test(row.email)) {
            row.valid = false;
            row.error = 'email形式が不正です';

          } else if (!['viewer', 'admin'].includes(row.permission)) {
            row.valid = false;
            row.error = '権限が不正です';
          }

          if (row.valid) {
            valid++;
          }

          rows.push(row);
        }

        this.csvRows = rows;
        this.validCount = valid;
      }
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
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -1px;
    background: white;
    color: #2C2C2C;
    border-radius: 7px;
    padding: 7px 15px;
    border: none;
    font-size: 16px;
    font-weight: bold;
    transition: background 0.16s, opacity 0.2s;
    margin-right: 5px;
    min-width: 90px;
    min-height: 42px;
    box-shadow: 0 1px 3px rgba(241,73,76,0.04);
    cursor: pointer;
    white-space: normal;
    border: 1px solid #FF9999; /* やや淡い赤のボーダー */
    justify-content: center;
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