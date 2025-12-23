<template>
  <div id="app">
    <router-view
      :user-role="userRole"
      @login-success="handleLoginSuccess"
      @logout="handleLogout"
    />
  </div>
</template>

<script>
import { authApi } from '@/api/authApi';

export default {
  name: 'App',

  data() {
    return {
      // アプリ全体で使うユーザーロール
      userRole: localStorage.getItem('userRole') || 'viewer',
    };
  },

  watch: {
    userRole(newRole) {
      console.log(`App.vue: userRole updated -> ${newRole}`);
    },
  },

  methods: {
    /**
     * ログイン成功時
     * Login コンポーネントから emit される
     */
    handleLoginSuccess(newRole) {
      this.userRole = newRole;
      console.log('App.vue: login success');
    },

    /**
     * ログアウト処理
     * API 呼び出しは authApi に委譲
     */
    async handleLogout() {
      const refreshToken = localStorage.getItem('refreshToken');

      try {
        if (refreshToken) {
          await authApi.logout(refreshToken);
          console.log('API: サーバー側ログアウト成功');
        }
      } catch (err) {
        console.warn('ログアウトAPIエラー:', err.response || err);
      } finally {
        // クライアント側状態をリセット
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');

        this.userRole = 'viewer';

        // 遷移制御は router.beforeEach に任せる
        this.$router.push('/login');
        console.log('クライアント側ログアウト完了');
      }
    },
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  font-family: 'Inter', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}
</style>