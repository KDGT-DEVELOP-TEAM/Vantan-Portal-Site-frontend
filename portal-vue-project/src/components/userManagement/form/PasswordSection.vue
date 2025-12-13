<template>
    <div class="form-section">
      <label for="password">パスワード <span class="required">(必須)</span></label>
      <input 
        id="password"
        type="password"
        placeholder="8文字以上12文字以内で英数字記号全て含んで入力してください" 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        required
        class="form-input"
      />
      <p v-if="error" class="error-message">
        {{ Array.isArray(error) ? error[0] : error }}
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: "PasswordSection",
  
    props: {
      modelValue: {
        type: String,
        default: ""
      },
      error: {
        type: [String, Array],
        default: null
      }
    },
  
    emits: ["update:modelValue"],
  };
  </script>
  
  <style scoped>
  .form-section {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }
  
  .required {
    color: #dc3545;
    margin-left: 4px;
  }
  
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.9em;
    margin-top: 5px;
  }
  </style>
  