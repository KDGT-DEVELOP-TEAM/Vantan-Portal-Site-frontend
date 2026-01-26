<template>
  <div class="auth-page">
    <h1 class="page-title">{{ $t('auth.emailSent.title') }}</h1>

    <div class="auth-box">
      <p class="description">
        {{ $t('auth.emailSent.description') }}
      </p>

      <p class="note">
        {{ $t('auth.emailSent.note') }}
      </p>

      <router-link :to="{ name: 'Login' }" class="primary-button">
        {{ $t('auth.emailSent.backToLogin') }}
      </router-link>
    </div>

    <div class="footer-copy">{{ $t('common.copyright') }}</div>
  </div>
</template>
  
<style scoped>
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #fff 50%, #fdebeb 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 80px;
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

  .auth-box {
    background: white;
    padding: 30px 40px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 520px;
    text-align: center;
  }

  .description {
    margin-bottom: 20px;
    color: #2c2c2c;
    line-height: 1.6;
    text-align: left;
  }

  .note {
    font-size: 0.85rem;
    color: #999;
    margin-bottom: 30px;
  }

  .primary-button {
    display: block;
    width: 100%;
    padding: 12px;
    background-color: #d94b4b;
    color: white;
    border-radius: 6px;
    text-align: center;
    font-size: 1rem;
    font-weight: bold;
    text-decoration: none;
    transition: background-color 0.3s;
  }

  .primary-button:hover {
    background-color: #c0392b;
  }

  .footer-copy {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 12px;
    color: #333;
  }
</style>