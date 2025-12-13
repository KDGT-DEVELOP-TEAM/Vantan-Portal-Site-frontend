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
import BulkRegisterModal from './AddUsersLumpsumScreen.vue'; // モーダルをインポート
import router from '@/router'; // routerのインポート方法を仮定 (プロジェクト依存)

const API_BASE_URL = 'http://127.0.0.1:8085';
const CREATE_USER_API_URL = `${API_BASE_URL}/api/users/`;

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
            isBulkRegisterModalVisible: false, // モーダルの表示状態
        };
    },

    methods: {
        clearValidationErrors() {
            this.validationErrors = {};
        },

        // --- モーダル関連のハンドラー ---
        handleOpenBulkRegister() {
            this.isBulkRegisterModalVisible = true;
        },
        handleCloseBulkRegister() {
            this.isBulkRegisterModalVisible = false;
        },
        handleBulkRegisterSuccess() {
            this.successMessage = 'ユーザーが一括登録されました。リストを更新します。';
            this.$emit('userCreated');
            setTimeout(() => {
                this.successMessage = null;
            }, 3000);
        },

        // --- 個別登録の処理 ---
        async handleFormSubmit(formData) {
            if (this.isLoading) return; 
        
            this.isLoading = true;
            this.generalError = null;
            this.successMessage = null;
            this.clearValidationErrors();
        
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                this.generalError = '認証トークンが見つかりません。ログインしてください。';
                this.isLoading = false;
                setTimeout(() => router.push('/login'), 1500); 
                return;
            }
            
            const payload = {
                email: formData.email,
                name: formData.name || null,
                password: formData.password,
                role: formData.role,
            };
        
            try {
                const response = await fetch(CREATE_USER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            
                const responseData = await response.json();
            
                if (!response.ok) {
                    if (response.status === 400) {
                        this.validationErrors = responseData;
                        this.generalError = '入力内容にエラーがあります。各フィールドを確認してください。';
                    } else if (response.status === 401 || response.status === 403) {
                        this.generalError = '管理者権限がないため、ユーザーを作成できません。';
                        setTimeout(() => router.push('/login'), 1500); 
                    } else {
                        throw new Error(responseData.detail || `HTTP Error: ${response.status}`);
                    }
                    return;
                }
            
                this.successMessage = `ユーザー（${responseData.email}）が正常に登録されました。`;
                this.$emit('userCreated'); 
                
                setTimeout(() => {
                    this.successMessage = null;
                }, 2000);
            
            } catch (err) {
                console.error("ユーザー登録エラー:", err);
                this.generalError = err.message || '不明なエラーが発生しました。';
            } finally {
                this.isLoading = false;
            }
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