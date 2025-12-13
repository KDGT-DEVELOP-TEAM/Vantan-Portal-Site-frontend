<template>
    <div class="form-section">
      <label for="name">名前 <span class="required">(任意)</span></label>
  
      <input 
        id="name"
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="例: 山田 太郎"
        class="form-input"
      />
  
      <p v-if="error" class="error-message">
        {{ Array.isArray(error) ? error[0] : error }}
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: "NameSection",
  
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
  
    emits: ["update:modelValue"]
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
    color: #444;
    letter-spacing: 0.03em;
  }
  .required {
    color: #b0b0b0;
    margin-left: 4px;
    font-size: 0.95em;
  }
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #bbb;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
    background: #fafafd;
    transition: border-color 0.2s;
  }
  .form-input:focus {
    outline: none;
    border-color: #007bff;
    background: #fff;
  }
  .error-message {
    color: #dc3545;
    font-size: 0.93em;
    margin-top: 6px;
    line-height: 1.5;
    letter-spacing: 0.01em;
  }
  </style>
  