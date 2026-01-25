<template>
  <div class="not-found">
    <h1>404</h1>
    <p>{{ $t('errors.notFound.message') }}</p>

    <p class="countdown">
      {{ $t('errors.notFound.countdownPrefix', { seconds: countdown }) }}
      {{ $t('common.home') }}
      {{ $t('errors.forbidden.countdownSuffix') }}
    </p>

    <button @click="goHome">{{ $t('errors.notFound.backHome') }}</button>
  </div>
</template>

<script>
  export default {
    name: 'NotFound404',
    data() {
      return {
        countdown: 8,
        timer: null,
      };
    },
    methods: {
      goHome() {
        // 多重遷移を防ぐ
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        this.$router.push('/home');
      },
    },
    mounted() {
      this.timer = setInterval(() => {
        this.countdown -= 1;

        if (this.countdown <= 0) {
          this.goHome();
        }
      }, 1000);
    },
    beforeUnmount() {
      if (this.timer) clearInterval(this.timer);
    },
  };
</script>

<style scoped>
  .not-found {
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