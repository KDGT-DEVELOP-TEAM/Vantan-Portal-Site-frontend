<template>
    <form @submit.prevent="handleSubmit" class="add-user-form">
      <div class="header-actions">
        <button type="button" @click="$emit('openBulkRegister')" class="bulk-register-button">
          一括登録
        </button>
      </div>
      <EmailSection v-model="formData.email" :error="errors.email" />

      <NameSection v-model="formData.name" :error="errors.name" />

      <PasswordSection v-model="formData.password" :error="errors.password" />

      <ConfirmPasswordSection v-model="formData.password_confirmation" :error="errors.password_confirmation" />

  
      <div class="form-section">
        <label for="role">ロール <span class="required">(必須)</span></label>
        <select id="role" v-model="formData.role" required class="form-select select-dropdown grade-hover-select">
          <option value="viewer">保護者</option>
          <option value="admin">管理者</option>
        </select>
      </div>
      
      <div class="form-actions">
        <AddUserSubmitButton :is-loading="isLoading" />
      </div>
    </form>
  </template>
  
  <script>
  import EmailSection from '../form/EmailSection.vue';
  import PasswordSection from '../form/PasswordSection.vue';
  import ConfirmPasswordSection from '../form/ConfirmPasswordSection.vue';
  import NameSection from '../form/NameSection.vue';
  import AddUserSubmitButton from './AddUserSubmitButton.vue';
  
  export default {
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
        type: Object,
        default: () => ({})
      }
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
      };
    },
  
    methods: {
      handleSubmit() {
        if (!this.formData.email || !this.formData.password || !this.formData.role) {
          alert('全ての必須項目を入力してください。');
          return;
        }
        if (this.formData.password !== this.formData.password_confirmation) {
            alert('パスワードが一致しません');
            return;
        }

        this.$emit('submit', { ...this.formData }); 
      },
    },
  };
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