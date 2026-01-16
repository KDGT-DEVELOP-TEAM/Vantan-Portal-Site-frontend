<template>
  <div class="form-section">
    <label for="passwordConfirmation">
      パスワード確認 <span class="required">(必須)</span>
    </label>

    <input
      id="passwordConfirmation"
      type="password"
      class="form-input"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="もう一度パスワードを入力"
    />

    <p v-if="errors.password_confirmation?.[0]" class="error-message">
      {{ errors.password_confirmation[0] }}
    </p>
  </div>
</template>

<script>
  export default {
    name: 'ConfirmPasswordSection',

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