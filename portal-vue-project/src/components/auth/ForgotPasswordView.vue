<template>
  <div class="login-page">
    <h1 class="page-title">メール送信ページ</h1>

    <div class="login-card">

      <p class="description">
        ご登録のメールアドレスを入力してください。<br />
        再設定用URLを記載したメールを送信します。
      </p>

      <!-- エラー -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="submitResetRequest">

        <!-- 統一フォームデザイン -->
        <div class="input-section">
          <label class="input-label">
            メールアドレス <span class="required">(必須)</span>
          </label>
          <input
            type="email"
            class="input-field"
            v-model="email"
            required
            :disabled="loading"
            placeholder="mail@example.com"
          />
        </div>

        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="loading">送信中...</span>
          <span v-else>メールを送信する</span>
        </button>

        <router-link
          v-if="!loading"
          :to="{ name: 'Login' }"
          class="back-link"
        >
          &lt; ログイン画面に戻る
        </router-link>
        <span
          v-else
          class="back-link disabled"
          aria-disabled="true"
        >
          &lt; ログイン画面に戻る
        </span>

      </form>
    </div>
    <div class="footer-copy">©VANTAN Inc.</div>
  </div>
</template>
  
<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { requestPasswordResetApi } from '@/api/auth'
  
  const router = useRouter()
  const email = ref('')
  const loading = ref(false)
  const errorMessage = ref('')
  
  const submitResetRequest = async () => {
    errorMessage.value = '';
    loading.value = true;

    if (!email.value) {
      errorMessage.value = 'メールアドレスを入力してください。';
      loading.value = false;
      return;
    }

    try {
      await requestPasswordResetApi(email.value);
      await router.push('/forgot-password/sent');
    } catch (e) {
      errorMessage.value =
        e?.response?.data?.detail ??
        '送信中にエラーが発生しました'
    } finally {
      loading.value = false;
    }
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
  