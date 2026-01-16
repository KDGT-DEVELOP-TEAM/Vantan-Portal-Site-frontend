<template>
  <div class="form-section">
    <label for="email">
      メールアドレス <span class="required">(必須)</span>
    </label>

    <input
      id="email"
      type="email"
      class="form-input"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="test@example.com"
      required
    />

    <p v-if="errors.email?.[0]" class="error-message">
      {{ errors.email[0] }}
    </p>
  </div>
</template>

<script>
  export default {
    name: 'EmailSection',

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