<template>
  <div class="user-edit-screen-container">
    <div class="header">
      <h2>{{ $t('user.edit.titleWithEmail', { email: initialUser.email }) }}</h2>

      <button type="button" class="back-button" @click="$emit('cancelEdit')">
        <span class="material-symbols-outlined">arrow_back_ios</span>
        {{ $t('common.back') }}
      </button>
    </div>

    <form class="edit-user-form" @submit.prevent="handleSubmit" novalidate>
      <!-- Email -->
      <EmailSection
        v-model="formData.email"
        :errors="{ email: errors.email }"
      />

      <!-- Name -->
      <NameSection
        v-model="formData.name"
        :errors="{ name: errors.user_name }"
      />

      <!-- Password（任意：入力補助のみ。DRFに一任） -->
      <PasswordSection
        v-model="formData.password"
        :errors="{ password: errors.password }"
      />

      <!-- Confirm Password -->
      <ConfirmPasswordSection
        v-model="formData.password_confirmation"
        :errors="{ password_confirmation: errors.password_confirmation }"
      />

      <!-- Role（UI表示） -->
      <div class="form-section">
        <label for="role">
          {{ $t('user.edit.roleLabel') }}
          <span class="required">({{ $t('common.required') }})</span>
        </label>

        <select
          id="role"
          v-model="formData.role"
          class="form-select select-dropdown grade-hover-select"
        >
          <option value="viewer">{{ $t('user.roles.viewer') }}</option>
          <option value="admin">{{ $t('user.roles.admin') }}</option>
        </select>

        <div v-if="errors.role?.[0]" class="input-error">
          {{ errors.role[0] }}
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? $t('common.updating') : $t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
  import EmailSection from './form/EmailSection.vue';
  import NameSection from './form/NameSection.vue';
  import PasswordSection from './form/PasswordSection.vue';
  import ConfirmPasswordSection from './form/ConfirmPasswordSection.vue';
  import { userApi } from '@/api/userManagementApi';

  export default {
    name: 'UserEditScreen',

    components: {
      EmailSection,
      NameSection,
      PasswordSection,
      ConfirmPasswordSection,
    },

    props: {
      initialUser: {
        type: Object,
        required: true,
      },
    },

    emits: ['userUpdated', 'cancelEdit', 'error'],

    data() {
      return {
        isLoading: false,
        // Record<string, string[]> を維持
        errors: {},

        formData: {
          email: '',
          name: '',
          password: '',
          password_confirmation: '',
          role: 'viewer',
        },
      };
    },

    computed: {
      SHOULD_SEND_ROLE() {
        return import.meta.env.VITE_SEND_ROLE === 'true';
      },
    },

    watch: {
      initialUser: {
        immediate: true,
        deep: true,
        handler(user) {
          this.formData.email = user.email || '';
          this.formData.name = user.user_name || '';
          this.formData.role = user.role || 'viewer';
          this.formData.password = '';
          this.formData.password_confirmation = '';
          this.errors = {};
        },
      },
    },

    methods: {
      async handleSubmit() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.errors = {};

        // フロントではバリデーションしない（DRFに一任）
        const payload = {
          email: this.formData.email,
          user_name: this.formData.name || '',
          ...(this.SHOULD_SEND_ROLE ? { role: this.formData.role } : {}),
        };

        // パスワードが入力されている場合のみ送る（入力補助の範囲）
        if (this.formData.password) {
          payload.password = this.formData.password;
          payload.password_confirmation = this.formData.password_confirmation;
        }

        try {
          await userApi.update(this.initialUser.id, payload);
          this.$emit('userUpdated');
        } catch (error) {
          const status = error?.response?.status;
          if (status === 400 && error?.response?.data) {
            // DRFのerrorsをそのまま表示（Record<string, string[]>想定）
            this.errors = error.response.data;
          }
          this.$emit('error', error);
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
</script>

<style scoped>
  .user-edit-screen-container {
      padding: 0;
      margin: 0;
      box-shadow: none;
  }

  .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 0;
      text-align: left;
  }

  h2 {
      font-size: 1.5em;
      color: #F1494C;
      font-weight: bold;
  }

  .back-button {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      font-size: 1em;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 4px;
      white-space: nowrap;
  }

  .back-button:hover {
      background-color: #f0f8ff;
  }

  .material-symbols-outlined {
      font-size: 1.1em;
  }

  .edit-user-form {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
  }

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

  /* セレクトメニュー基本スタイル */
  .form-select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 1em;
      height: 40px;
      appearance: none;
  }

  /* AddUserForm と同じドロップダウン見た目 */
  .select-dropdown {
      width: 20%;
      padding: 8px 10px;
      border: 1px solid #FF9999;
      border-radius: 4px;
      font-size: 1rem;
      background-color: white;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 16px;
      position: relative;
      top: -2px;
  }

  /* ホバー・フォーカス時の演出 */
  .grade-hover-select:hover {
      background-color: #FFF7F7 !important;
      border: 1px solid #F1494C !important;
  }

  .grade-hover-select:hover,
  .grade-hover-select:focus {
      outline: none;
  }

  /* メッセージとボタン */
  .submit-button {
      width: 100%;
      max-width: 100%;
      padding: 10px 0;
      font-size: 1em;
      border: none;
      border-radius: 5px;
      background-color: #F1494C;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
      box-shadow: 0 2px 6px rgba(241, 73, 76, 0.10);
  }

  .submit-button:hover:not(:disabled) {
      background-color: white;
      box-shadow: inset 0 0 0 2px #F1494C;
      color: #F1494C;
  }

  .submit-button:disabled {
      background-color: #f9d3d3;
      cursor: not-allowed;
  }

  .success-alert {
      padding: 15px;
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      margin-bottom: 20px;
      font-weight: bold;
  }

  .error-alert {
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      margin-bottom: 20px;
      font-weight: bold;
  }

  .input-error {
      color: #dc3545;
      font-size: 0.8em;
      margin-top: 5px;
  }

  .form-actions {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: 24px;
  }
</style>