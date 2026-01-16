<template>
  <div class="form-section">
    <label for="password">
      パスワード <span class="required">(必須)</span>
    </label>

    <input
      id="password"
      type="password"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-input"
      placeholder="8文字以上12文字以内で英数字記号すべて含めて入力してください"
    />

    <p v-if="errors.password?.[0]" class="error-message">
      {{ errors.password[0] }}
    </p>
  </div>
</template>

<script>
  export default {
    name: 'PasswordSection',

    props: {
      modelValue: {
        type: String,
        required: true,
      },

      /**
       * DRF validation errors
       * Record<string, string[]>
       */
      errors: {
        type: Object,
        required: false,
        default: () => ({}),
      },
    },

    emits: ['update:modelValue'],
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