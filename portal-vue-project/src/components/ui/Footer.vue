<template>
    <footer class="footer">
      <p>©VANTAN Inc.</p>
      <div class="social-icons">
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer',
  }
  </script>
  
  <style scoped>
  .footer {
    padding: 15px 20px;
    background-color: #fff;
    border-top: 1px solid #eee;
    color: #888;
    font-size: 0.8rem;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .social-icons {
    display: flex;
    gap: 5px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  </style>