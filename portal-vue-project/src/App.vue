<template>
  <div id="app">
    <router-view 
      :user-role="userRole" 
      @logout="handleLogout" 
      @login-success="handleLoginSuccess" ></router-view> 
  </div>
</template>
<script>
import axios from 'axios'; 

// ★ Django APIのベースURLとエンドポイント
const API_BASE_URL = 'http://127.0.0.1:8085'; // 適切なDjangoのホストとポートに修正してください(被らないようにしているだけです)
const LOGIN_ENDPOINT = '/api/auth/login/';
const LOGOUT_ENDPOINT = '/api/auth/logout/'; 

export default {
  name: 'App',
  components: {
    // router-viewを使用しているため、直接的なコンポーネントインポートは不要
  },
  data() {
    return {
      // ロール情報は、認証状態やUIの表示切り替えのためにApp.vueで管理します
      userRole: localStorage.getItem('userRole') || 'viewer', 
    };
  },
  watch: {
    // userRoleが変更されたら、router-viewにも再描画が促されます
    userRole(newRole) {
      // 実際にはあまり必要ありませんが、データの流れを明確にするために監視を追加
      console.log(`App.vue: User role updated to ${newRole}`);
    }
  },
  created() {
    // ページロード時: トークンとロールをチェックし、適切な画面に強制遷移（リロード時の認証状態復元）
    this.checkAuthAndRedirect();
  },
  // Vue Routerのルート変更時にも認証チェックを行う（必須ではないが、より堅牢な実装）
  // watch $route を使ったチェックは、ナビゲーションガード (router/index.js) で行う方が一般的で推奨されます。

  methods: {
    checkAuthAndRedirect() {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole'); 

      if (role) {
        this.userRole = role;
      }
      
      // トークンが存在し、かつ現在ログイン画面にいる場合 -> ホームへ
      if (token && this.$route.path === '/login') {
        this.$router.push('/home');
      } 
      // パスワード変更ページに移動できないため削除
      // それ以外の場合は何もしない（ルーターのデフォルト動作に任せる）
    },
    handleLoginSuccess(newRole) {
      // LoginFormから新しいロールを受け取り、App.vueのリアクティブなデータ userRole を更新する
      this.userRole = newRole;
      console.log(`App.vue: ログイン成功イベントを受信。userRoleを ${newRole} に即時更新しました。`);
    },
    // ★ ログアウト処理の実装
    async handleLogout() {
      // 修正点: ローカルストレージからトークンを正しく取得
      const refreshToken = localStorage.getItem('refreshToken');
      // const accessToken = localStorage.getItem('accessToken'); // サーバーに送る必要はないが、参照のために取得できます

      try {
        if (refreshToken) {
          // 1. Django APIをコールしてリフレッシュトークンを無効化（サーバー側のセッション破棄）
          const LOGOUT_ENDPOINT = '/api/auth/logout/'; // App.vueで定義されていますが、念のため
          await axios.post(`${API_BASE_URL}${LOGOUT_ENDPOINT}`, { 
              refresh: refreshToken 
          });
          console.log('API: サーバー側セッション破棄に成功しました。');
        }
      } catch (err) {
        // APIコールが失敗した場合でも、クライアント側トークンの削除と画面遷移は実行します。
        console.warn('ログアウトAPIコール中にエラーが発生しましたが、クライアント側の処理を続行します:', err.response || err);
      } finally {
        // 2. クライアント側のトークンと状態をリセット
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole'); // ロールを削除
        
        // userRoleをリセットし、管理者UIなどを非表示にする
        this.userRole = 'viewer';
        
        // 3. ログイン画面にリダイレクト (URL変更と画面切り替え)
        this.$router.push('/login');
        console.log('クライアント処理完了: トークン削除、ログイン画面へ遷移しました。');
      }
    }
  },
}
</script>

<style>
/* グローバルスタイル (App.vueのスタイルは最小限でOK) */
html, body {
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
  /* 既存の #app のリセットは保持 */
  margin: 0;
  padding: 0;
  min-height: 100vh; /* 画面全体の高さを確保 */
}
</style>