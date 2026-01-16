<template>
  <form @submit.prevent="handleSubmit" class="add-user-form" novalidate>
    <!-- 上部アクション -->
    <div class="header-actions">
      <button
        type="button"
        @click="$emit('openBulkRegister')"
        class="bulk-register-button"
      >
        一括登録
      </button>
    </div>

    <!-- Email -->
    <EmailSection
      v-model="formData.email"
      :errors="{ email: [localErrors.email?.[0] || errors?.email?.[0]] }"
    />

    <!-- Name -->
    <NameSection
      v-model="formData.name"
      :errors="{ name: [localErrors.name?.[0] || errors?.name?.[0]] }"
    />

    <!-- Password -->
    <PasswordSection
      v-model="formData.password"
      :errors="{ password: [localErrors.password?.[0] || errors?.password?.[0]] }"
    />

    <!-- Confirm Password -->
    <ConfirmPasswordSection
      v-model="formData.password_confirmation"
      :errors="{
        password_confirmation: [
          localErrors.password_confirmation?.[0] ||
          errors?.password_confirmation?.[0]
        ]
      }"
    />

    <!-- Role（UI表示用） -->
    <div class="form-section">
      <label for="role">
        権限区分 <span class="required">(必須)</span>
      </label>

      <div class="select-wrapper">
        <select
          id="role"
          v-model="formData.role"
          class="form-select select-dropdown grade-hover-select"
          required
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
        ※ 権限の付与・制御はサーバー側で行われます。
      </p>
    </div>

    <!-- Submit -->
    <div class="form-actions">
      <AddUserSubmitButton :is-loading="isLoading" />
    </div>
  </form>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import EmailSection from '../form/EmailSection.vue'
  import NameSection from '../form/NameSection.vue'
  import PasswordSection from '../form/PasswordSection.vue'
  import ConfirmPasswordSection from '../form/ConfirmPasswordSection.vue'
  import AddUserSubmitButton from './AddUserSubmitButton.vue'

  export type FormErrors = Record<string, string[]>

  export default defineComponent({
    name: 'AddUserForm',

    components: {
      EmailSection,
      NameSection,
      PasswordSection,
      ConfirmPasswordSection,
      AddUserSubmitButton
    },

    props: {
      errors: {
        type: Object as () => FormErrors,
        required: false,
        default: () => ({})
      },
      isLoading: {
        type: Boolean,
        required: false,
        default: false
      }
    },

    emits: ['submit', 'openBulkRegister'],

    data() {
      return {
        ROLES: [
          { value: 'viewer', label: '保護者' },
          { value: 'admin', label: '管理者' }
        ],
        formData: {
          email: '',
          name: '',
          password: '',
          password_confirmation: '',
          role: 'viewer'
        },
        localErrors: {} as Record<string, string[]>
      }
    },

    methods: {
      resetLocalErrors() {
        Object.keys(this.localErrors).forEach(key => {
          delete this.localErrors[key]
        })
      },

      validateForm(): boolean {
        this.resetLocalErrors()

        if (!this.formData.email) {
          this.localErrors.email = ['必須項目です']
        }

        if (!this.formData.password) {
          this.localErrors.password = ['必須項目です']
        }

        if (!this.formData.password_confirmation) {
          this.localErrors.password_confirmation = ['必須項目です']
        } else if (
          this.formData.password !== this.formData.password_confirmation
        ) {
          this.localErrors.password_confirmation = ['パスワードが一致しません']
        }

        return Object.keys(this.localErrors).length === 0
      },

      handleSubmit() {
        if (this.isLoading) return
        if (!this.validateForm()) return

        this.$emit('submit', { ...this.formData })
      }
    }
  })
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
  .helper-text {
    font-size: 0.85em;
    color: #666;
    margin-top: 6px;
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