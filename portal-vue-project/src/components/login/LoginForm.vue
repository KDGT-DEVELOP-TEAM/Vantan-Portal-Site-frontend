<template>
  <form class="login-card" @submit.prevent="handleLogin">
    <div v-if="error" class="error-message">{{ error }}</div>

    <LoginFormEmailSection v-model:email="email" />
    <LoginFormPasswordSection v-model:password="password" />

    <button class="login-button" type="submit" :disabled="loading">
      {{ loading ? $t('auth.loggingIn') : $t('auth.login') }}
    </button>

    <div class="forgot-password-container">
      <p class="forgot-password-link-text">
        {{ $t('auth.forgotPasswordPrefix') }}
      </p>
      <router-link
        :to="{ name: 'ForgotPassword' }"
        class="forgot-password-link"
      >
        {{ $t('auth.here') }}
      </router-link>
    </div>
  </form>
</template>

<script>
import LoginFormEmailSection from './LoginFormEmailSection.vue';
import LoginFormPasswordSection from './LoginFormPasswordSection.vue';
import { authApi } from '@/api/authApi';
import { setAuthenticated } from '@/store/authState';

export default {
  name: 'LoginForm',
  components: {
    LoginFormEmailSection,
    LoginFormPasswordSection,
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
      // 値が入っていない場合は何もしない（あるいはエラー表示）
      if (!this.email || !this.password) return;

      this.error = null;
      this.loading = true;

      try {
        const res = await authApi.login(this.email, this.password);

        localStorage.setItem('accessToken', res.data.access);
        localStorage.setItem('refreshToken', res.data.refresh);

        const userResponse = await authApi.fetchUserInfo();

        // 認証状態を更新
        setAuthenticated();

        const userData = userResponse.data;
        
        const permissions = userData.permissions || []

        localStorage.setItem('userPermissions', JSON.stringify(permissions));
        localStorage.setItem('userId', userData.id);

        if (userData.school) {
          localStorage.setItem('schoolIcon', userData.school.icon);
        }

        this.$emit('login-success');
        this.$router.push('/home');
      } catch (e) {
        this.error = this.$t('auth.loginFailed');
      } finally {
        this.loading = false;
      }
    },
  },
};
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

  .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .forgot-password-link {
    display: inline;
    font-size: 14px;
    color: #007bff;
    text-decoration: none;
  }

  .forgot-password-link:hover {
    text-decoration: underline;
  }

  .forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: baseline;
    width: 100%;
    margin-top: 8px;
  }

  .forgot-password-link-text {
    font-size: 14px;
    color: #f15b5b;
    margin: 0;
  }
</style>