<template>
    <button type="submit" :disabled="isLoading" class="submit-button">
      {{ isLoading ? '登録中...' : 'ユーザーを登録' }}
    </button>
  </template>
  
  <script>
  export default {
    name: "AddUserSubmitButton",
  
    props: {
      isLoading: {
        type: Boolean,
        default: false
      }
    }
  };
  </script>
  
  <style scoped>
  .submit-button {
    width: 100%;
    padding: 12px;
    background-color: #F1494C;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color 0.3s;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: white;
    box-shadow: 0 0 0 2px #F1494C inset;
    color: #F1494C;
  }
  
  .submit-button:disabled {
    background-color: #FF9999;
    cursor: not-allowed;
  }
  </style>
  