<template>
  <div class="add-user-screen-container">
    <div class="header">
      <h2>ユーザー追加</h2>
    </div>

    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>
    <div v-if="generalError" class="error-alert">
      {{ generalError }}
    </div>

    <AddUserForm 
      :is-loading="isLoading"
      :errors="validationErrors"
      @submit="handleFormSubmit"
      @openBulkRegister="handleOpenBulkRegister"
    />

    <BulkRegisterModal
      :is-visible="isBulkRegisterModalVisible"
      @close="handleCloseBulkRegister"
      @registered="handleBulkRegisterSuccess"
    />
  </div>
</template>
  
<script>
  import AddUserForm from './AddUserForm.vue';
  import BulkRegisterModal from './AddUsersLumpsumScreen.vue';
  import { userApi } from '@/api/userManagementApi';
  
  export default {
    name: 'AddUsersScreen',
    components: {
      AddUserForm,
      BulkRegisterModal,
    },
    emits: ['userCreated'],
  
    data() {
      return {
        isLoading: false,
        generalError: null,
        successMessage: null,
        validationErrors: {},
        isBulkRegisterModalVisible: false,
      };
    },
  
    methods: {
      clearValidationErrors() {
        this.validationErrors = {};
      },
  
      async handleFormSubmit(formData) {
        if (this.isLoading) return;
  
        this.isLoading = true;
        this.generalError = null;
        this.successMessage = null;
        this.clearValidationErrors();
  
        const payload = {
          email: formData.email,
          name: formData.name || null,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          // ここでroleを渡すことで、サーバー側で適切なGroup(admin/viewer等)に紐付けさせる
          role: formData.role, 
        };
  
        try {
          const { data } = await userApi.create(payload);
  
          this.successMessage = `ユーザー（${data.email}）が正常に登録されました。`;
          this.$emit('userCreated');
  
          setTimeout(() => {
            this.successMessage = null;
          }, 2000);
  
        } catch (error) {
          if (error.response?.status === 400) {
            // 詳細なバリデーションエラー（メール重複、パスワード強度不足など）
            this.validationErrors = error.response.data;
            this.generalError = '入力内容にエラーがあります。確認してください。';
          } else if (error.response?.status === 403) {
            this.generalError = 'ユーザーを作成する権限がありません。管理者にお問い合わせください。';
          } else {
            // その他サーバーエラー
            this.generalError = '通信エラーまたはサーバーエラーが発生しました。';
          }
        } finally {
          this.isLoading = false;
        }
      },

      handleOpenBulkRegister() {
        this.isBulkRegisterModalVisible = true;
      },
      handleCloseBulkRegister() {
        this.isBulkRegisterModalVisible = false;
      },
      handleBulkRegisterSuccess() {
        this.successMessage = 'ユーザーが一括登録されました。';
        this.$emit('userCreated');
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
    },
  };
</script>

<style scoped>
/* (スタイルは省略。前回の内容を使用してください) */
/* 親コンポーネント(UserList.vue)のスタイルで上書きされることを考慮し、最小限のスタイルを保持 */
.add-user-screen-container {
  padding: 0; 
  margin: 0;
  box-shadow: none; 
}

.header {
  margin-top: -20px;
  margin-bottom: 25px;
  border-bottom: none; 
  padding-bottom: 0;
  text-align: left;
}

h2 {
  font-size: 1.5em; /* リストのH2より少し小さく */
  color: #333;
  font-weight: bold;
  /* 画像の「ユーザー追加」の文字色に合わせて調整しても良い */
  color: #F1494C;
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
</style>