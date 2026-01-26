<template>
  <form @submit.prevent="handleSubmit" class="add-user-form" novalidate>
    <!-- 上部アクション -->
    <div class="header-actions">
      <button
        type="button"
        @click="$emit('openBulkRegister')"
        class="bulk-register-button"
        :disabled="isLoading"
      >
        {{ $t('user.add.bulkRegister') }}
      </button>
    </div>

    <!-- Email -->
    <EmailSection
      v-model="formData.email"
      :error="errors?.email?.[0]"
    />

    <!-- Name -->
    <NameSection
      v-model="formData.name"
      :errors="errors.user_name ? { name: errors.user_name } : {}"
    />


    <!-- Password -->
    <PasswordSection
      v-model="formData.password"
      :error="errors?.password?.[0]"
    />

    <!-- Confirm Password -->
    <ConfirmPasswordSection
      v-model="formData.password_confirmation"
      :error="errors?.password_confirmation?.[0]"
    />

    <!-- Role（UI表示のみ） -->
    <div class="form-section">
      <label for="role">
        {{ $t('user.bulk.generate.roleLabel') }}
        <span class="required">{{ $t('common.required') }}</span>
      </label>

      <div class="select-wrapper">
        <select
          id="role"
          v-model="formData.role"
          class="form-select select-dropdown grade-hover-select"
          :disabled="isLoading"
        >
          <option
            v-for="role in ROLES"
            :key="role.value"
            :value="role.value"
          >
            {{ role.label }}
          </option>
        </select>
      </div>

      <p v-if="errors?.role?.[0]" class="error-message">
        {{ errors.role[0] }}
      </p>

      <p class="helper-text">
        {{ $t('user.add.role.helper') }}
      </p>
    </div>

    <!-- Submit -->
    <div class="form-actions">
      <AddUserSubmitButton :is-loading="isLoading" />
    </div>
  </form>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import EmailSection from '../form/EmailSection.vue';
  import NameSection from '../form/NameSection.vue';
  import PasswordSection from '../form/PasswordSection.vue';
  import ConfirmPasswordSection from '../form/ConfirmPasswordSection.vue';
  import AddUserSubmitButton from './AddUserSubmitButton.vue';

  export type FormErrors = Record<string, string[]>;

  type RoleValue = 'viewer' | 'admin';

  export default defineComponent({
    name: 'AddUserForm',
    components: {
      EmailSection,
      NameSection,
      PasswordSection,
      ConfirmPasswordSection,
      AddUserSubmitButton,
    },
    props: {
      errors: {
        type: Object as () => FormErrors,
        required: false,
        default: () => ({}),
      },
      isLoading: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    emits: ['submit', 'openBulkRegister'],
    data() {
      return {
        formData: {
          email: '',
          name: '',
          password: '',
          password_confirmation: '',
          role: 'viewer' as RoleValue,
        },
      };
    },
    computed: {
      /**
       * UI表示用 Role 定義
       * ※ 認可・権限制御には使用しない
       */
      ROLES(): { value: RoleValue; label: string }[] {
        return [
          { value: 'viewer', label: this.$t('user.role.viewer') },
          { value: 'admin', label: this.$t('user.role.admin') },
        ];
      },
    },
    methods: {
      /**
       * フロントでは一切バリデーションを行わない
       * DRFへそのまま送信
       */
      handleSubmit() {
        if (this.isLoading) return;

        this.$emit('submit', {
          email: this.formData.email,
          user_name: this.formData.name || '',
          password: this.formData.password,
          password_confirmation: this.formData.password_confirmation,
          role: this.formData.role,
        });
      }
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

  .error-message {
    color: #dc3545;
    margin-top: 4px;
    font-size: 0.9em;
  }

  .helper-text {
    font-size: 0.85em;
    color: #666;
    margin-top: 6px;
  }

  .form-actions {
    margin-top: 30px;
  }

  .header-actions {
    display: flex;
    justify-content: flex-end;
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
  }

  .bulk-register-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .bulk-register-button:hover:not(:disabled) {
    background-color: #c93d40;
  }

  .select-wrapper {
    width: 20%;
  }

  .form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #FF9999;
    border-radius: 4px;
    font-size: 1em;
    background-color: white;
  }

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
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    position: relative;
    top: -2px;
  }

  .grade-hover-select:hover,
  .grade-hover-select:focus {
    background-color: #FFF7F7;
    border-color: #F1494C;
    outline: none;
  }
</style>