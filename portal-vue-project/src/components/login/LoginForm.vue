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
  import { authApi } from '@/api/authApi';

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
        this.error = null
        this.loading = true

        try {
          const res = await authApi.login(this.email, this.password)
          
          console.log('login response:', res.data);
          localStorage.setItem('accessToken', res.data.access)
          localStorage.setItem('refreshToken', res.data.refresh)

          const userResponse = await authApi.fetchUserInfo()

          const { setAuthenticated } = await import('@/store/authState')
          setAuthenticated()

          const userData = userResponse.data
          let permissions = []

          if (userData.is_staff) {
            permissions = ['user_manage', 'timeschedule_manage', 'news_manage']
          }

          localStorage.setItem('userPermissions', JSON.stringify(permissions))
          localStorage.setItem('userId', userData.id)

          this.$router.push('/home')
        } catch {
          this.error = 'ログインに失敗しました'
        } finally {
          this.loading = false
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