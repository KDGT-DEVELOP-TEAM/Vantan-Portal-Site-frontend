<template>
  <div class="auth-page">
    <h1 class="page-title">{{ $t('auth.resetConfirm.title') }}</h1>

    <div class="auth-box">
      <p v-if="checkingToken" class="description">
        {{ $t('auth.resetConfirm.checkingLink') }}
      </p>
      <p v-else-if="!successMessage" class="description">
        {{ $t('auth.resetConfirm.prompt') }}
      </p>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}<br>
        {{ $t('auth.resetConfirm.countdownToLogin', { seconds: countdown }) }}
      </div>

      <form
        v-if="!checkingToken && !successMessage"
        @submit.prevent="submitPasswordReset"
      >
        <div class="input-section">
          <label class="input-label">
            {{ $t('auth.resetConfirm.newPassword') }} 
            <span class="required">{{ $t('common.required') }}</span>
          </label>
          <input
            type="password"
            class="input-field"
            :placeholder="$t('auth.resetConfirm.newPasswordPlaceholder')"
            v-model="newPassword"
            required
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <div class="input-section">
          <label class="input-label">
            {{ $t('auth.resetConfirm.confirmPassword') }} 
            <span class="required">{{ $t('common.required') }}</span>
          </label>
          <input
            type="password"
            class="input-field"
            :placeholder="$t('auth.resetConfirm.confirmPasswordPlaceholder')"
            v-model="reNewPassword"
            required
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="primary-button" :disabled="loading">
          <span v-if="loading">{{ $t('common.setting') }}</span>
          <span v-else>{{ $t('auth.resetConfirm.submit') }}</span>
        </button>
        
        <button
          type="button"
          class="cancel-button"
          @click="router.push({ name: 'Login' })"
          :disabled="loading"
        >
          {{ $t('common.cancel') }}
        </button>
      </form>

      <router-link
        v-if="successMessage"
        :to="{ name: 'Login' }"
        class="back-link"
      >
        {{ $t('auth.resetConfirm.toLogin') }}
      </router-link>
    </div>

    <div class="footer-copy">{{ $t('common.copyright') }}</div>
  </div>
</template>
  
<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { confirmPasswordResetApi, verifyResetTokenApi } from '@/api/auth'
  
  const router = useRouter()
  const route = useRoute()
  
  const newPassword = ref('')
  const reNewPassword = ref('')
  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  
  const uid = ref('')
  const token = ref('')
  const checkingToken = ref(true)
  
  const countdown = ref(8)
  let countdownInterval = null
  
  onMounted(async () => {
    // route.params から確実に取得
    uid.value = route.params.uid ? String(route.params.uid) : ''
    token.value = route.params.token ? String(route.params.token) : ''
  
    if (!uid.value || !token.value) {
      errorMessage.value = $t('auth.resetConfirm.errors.missingParams')
      checkingToken.value = false
      return
    }
  
    try {
      await verifyResetTokenApi({ uid: uid.value, token: token.value })
    } catch (e) {
      errorMessage.value = $t('auth.resetConfirm.errors.invalidOrExpired')
    } finally {
      checkingToken.value = false
    }
  })
  
  onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval)
  })
  
  const startCountdown = () => {
    countdown.value = 8
    countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownInterval)
        router.push({ name: 'Login' })
      }
    }, 1000)
  }
  
  const submitPasswordReset = async () => {
    errorMessage.value = ''
    
    // バリデーション
    if (newPassword.value.length < 8) {
      errorMessage.value = $t('auth.resetConfirm.errors.tooShort')
      return
    }
    if (newPassword.value !== reNewPassword.value) {
      errorMessage.value = $t('auth.resetConfirm.errors.notMatch')
      return
    }
  
    loading.value = true
    try {
      await confirmPasswordResetApi({
        uid: uid.value,
        token: token.value,
        newPassword: newPassword.value,
      })
  
      successMessage.value = $t('auth.resetConfirm.success')
      startCountdown()
    } catch (e) {
      errorMessage.value = $t('auth.resetConfirm.errors.failed')
    } finally {
      loading.value = false
    }
  }
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