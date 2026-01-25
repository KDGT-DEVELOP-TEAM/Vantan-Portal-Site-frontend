<template>
  <div class="forbidden">
    <h1>403</h1>

    <p>{{ $t('errors.forbidden.message') }}</p>

    <p class="countdown">
      {{ $t('errors.forbidden.countdownPrefix', { seconds: countdown }) }}
      {{ isAuthenticated ? $t('common.home') : $t('auth.login') }}
      {{ $t('errors.forbidden.countdownSuffix') }}
    </p>

    <button @click="goBack">
      {{ isAuthenticated ? $t('errors.forbidden.backHome') : $t('errors.forbidden.backLogin') }}
    </button>
  </div>
</template>

<script>
  export default {
    name: 'Forbidden403',
    data() {
      return {
        countdown: 8,
        timer: null,
      };
    },
    computed: {
      isAuthenticated() {
        return !!localStorage.getItem('accessToken');
      },
    },
    methods: {
      goBack() {
        // 念のためタイマー停止（連打や多重遷移を防ぐ）
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }

        this.$router.push(this.isAuthenticated ? '/home' : '/login');
      },
    },
    mounted() {
      this.timer = setInterval(() => {
        this.countdown -= 1;

        if (this.countdown <= 0) {
          this.goBack();
        }
      }, 1000);
    },
    beforeUnmount() {
      if (this.timer) clearInterval(this.timer);
    },
  };
</script>

<style scoped>
  .forbidden {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  h1 {
    font-size: 72px;
    color: #F1494C;
    margin-bottom: 16px;
    opacity: 0;
    animation: appear 0.2s ease-out forwards, shake 0.4s ease-in-out;
  }

  @keyframes appear {
    to { opacity: 1; }
  }

  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }

  p {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .countdown {
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;
  }

  button {
    padding: 10px 20px;
    background-color: #F1494C;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  button:hover {
    background-color: white;
    color: #F1494C;
    box-shadow: inset 0 0 0 2px #F1494C;
  }
</style>