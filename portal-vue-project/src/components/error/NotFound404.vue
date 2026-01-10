<template>
    <div class="not-found">
      <h1>404</h1>
      <p>このページは存在しません。</p>
  
      <p class="countdown">
        {{ countdown }}秒後にホームに戻ります
      </p>
  
      <button @click="goHome">ホームに戻る</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound404',
    data() {
      return {
        countdown: 8,
        timer: null
      }
    },
    methods: {
      goHome() {
        this.$router.push('/home')
      }
    },
    mounted() {
      this.timer = setInterval(() => {
        this.countdown--
  
        this.countdown <= 0 ? this.goHome() : null
      }, 1000)
    },
    beforeUnmount() {
      clearInterval(this.timer)
    }
  }
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
    to {
      opacity: 1;
    }
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