<template>
  <div class="auth-page">
    <h1 class="page-title">新しいパスワード設定</h1>

    <div class="auth-box">
      <p v-if="!checkingToken" class="description">
        新しいパスワードを入力してください。
      </p>
      <p v-else class="description">
        リンクを確認しています...
      </p>

      <!-- エラーメッセージ -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 成功メッセージとカウントダウン -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}<br>
        {{ countdown }}秒後にログイン画面に戻ります。
      </div>

      <!-- フォームは成功メッセージがない時だけ表示 -->
      <form
        v-if="!checkingToken && !successMessage"
        @submit.prevent="submitPasswordReset"
      >
        <!-- パスワード -->
        <div class="input-section">
          <label class="input-label">
            新しいパスワード <span class="required">(必須)</span>
          </label>
          <input
            type="password"
            class="input-field"
            placeholder="8文字以上12文字以内で英数字記号全て含んで入力してください"
            v-model="newPassword"
            required
            :disabled="loading"
          />
        </div>

        <!-- 確認用パスワード -->
        <div class="input-section">
          <label class="input-label">
            確認用パスワード <span class="required">(必須)</span>
          </label>
          <input
            type="password"
            class="input-field"
            placeholder="もう一度同じパスワードを入力してください"
            v-model="reNewPassword"
            required
            :disabled="loading"
          />
        </div>

        <!-- ボタン -->
        <button
          type="submit"
          class="primary-button"
          :disabled="loading"
        >
          <span v-if="loading">設定中...</span>
          <span v-else>パスワードを設定する</span>
        </button>
        
        <!-- キャンセルボタン -->
        <button
          type="button"
          class="cancel-button"
          @click="router.push('/login')"
          :disabled="loading"
        >
          キャンセル
        </button>
      </form>
      <router-link
        v-if="successMessage"
        :to="{ name: 'Login' }"
        class="back-link"
      >
        ログイン画面へ
      </router-link>
    </div>
    <div class="footer-copy">©VANTAN Inc.</div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import { confirmPasswordResetApi, verifyResetTokenApi } from '@/api/auth'

  const router = useRouter();
  const route = useRoute();
  
  const newPassword = ref("");
  const reNewPassword = ref("");
  const loading = ref(false);
  const errorMessage = ref("");
  const successMessage = ref("");
  
  const uid = ref("");
  const token = ref("");
  
  const checkingToken = ref(true)

  const countdown = ref(8);
  let countdownInterval = null;

  onMounted(async () => {
    uid.value = route.params.uid;
    token.value = route.params.token;
  
    if (!uid.value || !token.value) {
      errorMessage.value =
        "パスワード再設定に必要な情報が不足しています。";
      checkingToken.value = false;
      return;
    }

    try {
      await verifyResetTokenApi({ uid: uid.value, token: token.value })
    } catch {
      errorMessage.value =
        "このリンクは無効、または有効期限が切れています。";
    } finally {
      checkingToken.value = false;
    }
  });

  const startCountdown = () => {
    countdown.value = 8;
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval);
        router.push("/login");
      }
    }, 1000);
  };

  const submitPasswordReset = async () => {
    errorMessage.value = "";
    successMessage.value = "";
  
    if (newPassword.value.length < 8) {
      errorMessage.value = "パスワードは8文字以上で入力してください。"
      return
    }

    if (newPassword.value !== reNewPassword.value) {
      errorMessage.value = "パスワードが一致しません。";
      return;
    }

    if (!uid.value || !token.value) {
      errorMessage.value = "無効なリクエストです。";
      return;
    }

    loading.value = true;
    try {
      await confirmPasswordResetApi({
        uid: uid.value,
        token: token.value,
        newPassword: newPassword.value,
      });

      successMessage.value =
        "パスワードが正常に設定されました。ログイン画面に戻ってください。";
      startCountdown();
    } catch (e) {
      errorMessage.value = "パスワード設定中にエラーが発生しました。";
    } finally {
      loading.value = false;
    }
  };
</script>
  
<style scoped>
  /* 背景はログイン画面と統一 */
  .auth-page {
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
  
  /* カード UI も統一 */
  .auth-box {
    padding: 30px 40px;
    border: 1px solid #f15b5b;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(241, 91, 91, 0.3);
    background-color: white;
    max-width: 350px;
    width: 90%;
  }
  
  .description {
    margin-bottom: 20px;
    color: #666;
    line-height: 1.6;
    text-align: center;
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
  
  /* ボタンも統一 */
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

  .cancel-button {
    width: 100%;
    padding: 12px;
    background-color: #bbb;
    color: white;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    margin-top: 10px;
  }

    .cancel-button:hover:not(:disabled) {
    background-color: #999;
  }

  .cancel-button:disabled {
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
  
  .error-message,
  .success-message {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    text-align: left;
    color: white;
  }
  
  .error-message {
    background-color: #e74c3c;
  }
  
  .success-message {
    background-color: #2ecc71;
  }
  
  .footer-copy {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 12px;
    color: #333;
  }
</style>
  