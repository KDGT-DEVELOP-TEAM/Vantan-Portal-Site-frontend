<template>
    <div class="form-section">
      <label for="passwordConfirm">
        パスワード確認 <span class="required">(必須)</span>
      </label>
  
      <input
        id="passwordConfirm"
        type="password"
        class="form-input"
        v-model="model"
        placeholder="もう一度パスワードを入力"
      />
  
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ConfirmPasswordSection",
    props: {
      errors: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      isLoading: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["update:modelValue"],
  
    computed: {
      model: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit("update:modelValue", value);
        },
      },
    },
  };
  </script>
  
  <style scoped>
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
    box-sizing: border-box;
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

  .error-message {
    color: #dc3545;
    font-size: 0.9em;
    margin-top: 5px;
  }
  </style>
  