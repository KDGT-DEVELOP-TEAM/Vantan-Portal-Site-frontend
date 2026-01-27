<template>
  <div class="login-page">
    <h1 class="page-title">{{ $t('auth.forgot.title') }}</h1>

    <div class="login-card">
      <p class="description">
        {{ $t('auth.forgot.description') }}
      </p>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="submitResetRequest">
        <div class="input-section">
          <label class="input-label">
            {{ $t('auth.forgot.emailLabel') }}
            <span class="required">{{ $t('common.required') }}</span>
          </label>

          <input
            type="email"
            class="input-field"
            v-model="email"
            required
            :disabled="loading"
            :placeholder="$t('auth.forgot.emailPlaceholder')"
            autocomplete="email"
          />
        </div>

        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="loading">{{ $t('common.sending') }}</span>
          <span v-else>{{ $t('auth.forgot.submit') }}</span>
        </button>

        <router-link v-if="!loading" :to="{ name: 'Login' }" class="back-link">
          &lt; {{ $t('auth.forgot.backToLogin') }}
        </router-link>
        <span v-else class="back-link disabled" aria-disabled="true">
          &lt; {{ $t('auth.forgot.backToLogin') }}
        </span>
      </form>
    </div>

    <div class="footer-copy">{{ $t('common.copyright') }}</div>
  </div>
</template>

<script>
import { requestPasswordResetApi } from '@/api/auth';

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: '',
      loading: false,
      errorMessage: '',
    };
  },
  methods: {
    async submitResetRequest() {
      this.errorMessage = '';
      this.loading = true;

      if (!this.email) {
        this.errorMessage = this.$t('auth.forgot.validation.emailRequired');
        this.loading = false;
        return;
      }

      try {
        // API側が文字列を受ける場合も、payloadを受ける場合も吸収しやすい形
        await requestPasswordResetApi({ email: this.email });

        // パスではなく name 遷移（ルート変更に強い）
        await this.$router.push({ name: 'EmailSent' });
      } catch (e) {
        this.errorMessage =
          e?.response?.data?.detail ?? this.$t('auth.forgot.errors.sendFailed');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

  
<style scoped>
  /* 背景デザインはログインページと統一 */
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
  
  /* カード（LoginForm と統一） */
  .login-card {
    padding: 30px 40px;
    border: 1px solid #f15b5b;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(241, 91, 91, 0.3);
    background-color: white;
    max-width: 350px;
    width: 90%;
  }
  
  .description {
    text-align: center;
    margin-bottom: 20px;
    color: #2c2c2c;
    font-size: 0.95rem;
    white-space: pre-line;
  }
  
  /* 統一されたフォームデザイン */
  .input-section {
    margin-bottom: 25px;
  }
  
  .input-label {
    display: block;
    text-align: left;
    font-size: 14px;
    margin-bottom: 5px;
    color: #333;
  }
  
  .required {
    color: #f15b5b;
  }
  
  .input-field {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  /* 送信ボタン（LoginForm と統一） */
  .primary-button {
    width: 100%;
    padding: 12px;
    background-color: #d94b4b;
    color: white;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .primary-button:hover:not(:disabled) {
    background-color: #c0392b;
  }
  
  .primary-button:disabled {
    background-color: #ccc;
  }
  
  /* 戻るリンク */
  .back-link {
    display: block;
    margin-top: 15px;
    color: #3498db;
    text-decoration: none;
    text-align: center;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }

  .back-link.disabled {
    color: #aaa;
    cursor: not-allowed;
    text-decoration: none;
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
  
  /* フッターコピー位置 */
  .footer-copy {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 12px;
    color: #333;
  }
</style>
