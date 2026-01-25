<template>
  <div class="login-page">
    <h1 class="page-title">{{ $t('auth.login') }}</h1>
    <LoginForm @login-success="$emit('login-success', $event)" />
    <div class="footer-copy">©VANTAN Inc.</div>
  </div>
</template>

<script>
  import LoginForm from './LoginForm.vue'; 

  export default {
    name: 'LoginScreen',
    components: {
      LoginForm,
    },
    // App.vueにイベントを伝播させるために定義
    emits: ['login-success'] 
  }
</script>

<style scoped>
  .login-page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #fff 50%, #fdebeb 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 50px;
    position: relative;
  }

  .page-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 30px;
    padding-bottom: 5px;
    border-bottom: 3px solid #f15b5b;
  }

  .footer-copy {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 12px;
    color: #333;
  }
</style>