<template>
  <form @submit.prevent="handleSubmit" class="add-user-form" novalidate>
    <div class="header-actions">
      <button type="button" @click="$emit('openBulkRegister')" class="bulk-register-button">
        一括登録
      </button>
    </div>

    <EmailSection v-model="formData.email" :error="localErrors.email?.[0] || errors.email?.[0]" />
    <NameSection v-model="formData.name" :error="localErrors.name?.[0] || errors.name?.[0]" />
    <PasswordSection v-model="formData.password" :error="localErrors.password?.[0] || errors.password?.[0]" />
    <ConfirmPasswordSection v-model="formData.password_confirmation" :error="localErrors.password_confirmation?.[0] || errors.password_confirmation?.[0]" />

    <div class="form-section">
      <label for="role">ロール <span class="required">(必須)</span></label>
      <select
        id="role"
        v-model="formData.role"
        required
        class="form-select select-dropdown grade-hover-select"
      >
        <option v-for="role in ROLES" :key="role.value" :value="role.value">
          {{ role.label }}
        </option>
      </select>
      <p v-if="localErrors.role?.[0] || errors.role?.[0]" class="error-message">
        {{ localErrors.role?.[0] || errors.role?.[0] }}
      </p>
    </div>

    <div class="form-actions">
      <AddUserSubmitButton :is-loading="isLoading" />
    </div>
  </form>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import EmailSection from '../form/EmailSection.vue';
  import PasswordSection from '../form/PasswordSection.vue';
  import ConfirmPasswordSection from '../form/ConfirmPasswordSection.vue';
  import NameSection from '../form/NameSection.vue';
  import AddUserSubmitButton from './AddUserSubmitButton.vue';

  export type FormErrors = Record<string, string[]>;

  export const ROLES = [
    { label: '保護者', value: 'viewer' },
    { label: '管理者', value: 'admin' },
  ];

  export const ROLE_PERMISSIONS = {
    viewer: [],
    admin: ['user_manage'],
  };

  export default defineComponent({
    name: 'AddUserForm',
    components: {
      EmailSection,
      PasswordSection,
      ConfirmPasswordSection,
      NameSection,
      AddUserSubmitButton,
    },
    emits: ['submit', 'openBulkRegister'],
    props: {
      isLoading: {
        type: Boolean,
        default: false,
      },
      errors: {
        type: Object as PropType<FormErrors>,
        required: false,
        default: () => ({}),
      },
    },
    data() {
      return {
        formData: {
          email: '',
          name: '',
          password: '',
          password_confirmation: '',
          role: 'viewer',
        },
        localErrors: {} as FormErrors,
      };
    },
    methods: {
      handleSubmit() {
        this.localErrors = {};

        const requiredFields: Array<keyof typeof this.formData> = [
          'email',
          'password',
          'password_confirmation',
        ];

        requiredFields.forEach((field) => {
          if (!this.formData[field]) {
            this.localErrors[field] = ['必須項目です。'];
          }
        });

        // ▼ パスワード強度チェック（UI補助）
        const password = this.formData.password;
        const passwordPattern =
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,12}$/;

        if (password && !passwordPattern.test(password)) {
          this.localErrors.password = [
            '8〜12文字で、英字・数字・記号をすべて含めてください。',
          ];
        }

        // 一致チェック
        if (
          password &&
          this.formData.password_confirmation &&
          password !== this.formData.password_confirmation
        ) {
          this.localErrors.password_confirmation = ['パスワードが一致しません。'];
        }

        if (Object.keys(this.localErrors).length > 0) {
          return;
        }

        this.$emit('submit', { ...this.formData });
      }


    },
    computed: {
      ROLES() {
        return ROLES;
      },
    },
  });
</script>

<style scoped>
  
  .add-user-form {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .form-section {
    margin-bottom: 20px;
    text-align: left;
  }

  .error-message {
    color: #dc3545;
    margin-top: 4px;
    font-size: 0.9em;
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
</style>