<template>
  <div class="login-card">
    <div v-if="error" class="error-message">{{ error }}</div> 
    
    <LoginFormEmailSection v-model:email="email" /> 
    <LoginFormPasswordSection v-model:password="password" />

    <button class="login-button" @click="handleLogin" :disabled="loading">
      {{ loading ? 'ログイン中...' : 'ログイン' }}
    </button>
    
    <div style="display: flex; justify-content: center; align-items: baseline; width: 100%; margin-top: 8px;">
      <p class="forgot-password-link-text" style="margin-bottom: 0;">パスワードがわからない場合は </p>
      <a href="#" class="forgot-password-link" style="margin-left: 2px;">こちら</a>
    </div>
  </div>
</template>

<script>
import LoginFormEmailSection from './LoginFormEmailSection.vue'; 
import LoginFormPasswordSection from './LoginFormPasswordSection.vue';
import axios from 'axios'; 

// ★★★ 修正後のAPIベースURL設定 ★★★
const API_BASE_URL = 'http://127.0.0.1:8085';
// const API_BASE_URL = 'http://127.0.0.1:8000';

// ★★★ 認証エンドポイント (urls.pyに合わせて修正) ★★★
const LOGIN_ENDPOINT = '/api/auth/login/'; // 正しいトークン取得API

// ★★★ ユーザー情報取得エンドポイント（仮のパス） ★★★
const USER_ME_ENDPOINT = '/api/auth/user/'; 

export default {
  name: 'LoginForm',
  components: {
    LoginFormEmailSection,
    LoginFormPasswordSection
  },
  emits: ['login-success'], 
  data() {
      return {
          email: '',
          password: '',
          error: null, 
          loading: false, 
      };
  },
  methods: {
      async handleLogin() { 
          this.error = null;
          this.loading = true;

          if (!this.email || !this.password) {
              this.error = 'メールアドレスとパスワードを入力してください。';
              this.loading = false;
              return;
          }

          try {
              // 1. 認証トークンの取得APIコール
              const tokenResponse = await axios.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, { 
                  email: this.email,
                  password: this.password,
              });

              const accessToken = tokenResponse.data.access;
              // ★ 修正: リフレッシュトークンも取得し保存する
              const refreshToken = tokenResponse.data.refresh;
              
              // 2. アクセストークンとリフレッシュトークンを保存
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', refreshToken); // ★ 追加

              // 3. ユーザー情報を取得し、ロールを判定
              const userResponse = await axios.get(`${API_BASE_URL}${USER_ME_ENDPOINT}`, {
                  headers: {
                      Authorization: `Bearer ${accessToken}`
                  }
              });

              const userData = userResponse.data;
              // ロール判定: is_superuserではなく、roleフィールドを正として使用
              const userRole = userData.role || 'viewer'; 
              
              // ロールも保存（リロード時の復元のため）
              localStorage.setItem('userRole', userRole);
              
              this.$emit('login-success', userRole);
              
              // 4. ホームに遷移
              this.$router.push('/home');
          } catch (err) {
              console.error('ログインAPIエラー:', err.response || err);
              
              if (err.response && err.response.status === 401) {
                   this.error = '認証情報が無効です。メールアドレスまたはパスワードを確認してください。';
              } else {
                   this.error = 'サーバーとの通信に失敗しました。認証情報、CORS設定、またはDjangoのAPIパスを確認してください。';
              }

          } finally {
              this.loading = false;
          }
      }
  }
}
</script>
  
  <style scoped>
  .login-card {
    padding: 30px 40px;
    border: 1px solid #f15b5b;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(241, 91, 91, 0.3);
    background-color: white;
    max-width: 350px;
    width: 90%;
  }
  .error-message { 
    color: white;
    background-color: #f15b5b;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 15px;
    font-size: 14px;
    text-align: center;
  }
  .login-button {
    width: 100%;
    padding: 12px;
    background-color: #f15b5b;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 30px;
    transition: background-color 0.3s;
  }
  .login-button:hover {
    background-color: #e04b4b;
  }
  .forgot-password-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #007bff; /* 青色リンク */
      text-decoration: none;
  }
  .forgot-password-link:hover {
      text-decoration: underline;
  }
  .forgot-password-link-text {
    display: block;
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #f15b5b;
    text-decoration: none;
  }
  </style>