<template>
  <div class="form-section">
    <label for="password">
      {{ $t('user.add.passwordLabel') }}
      <span class="required">{{ $t('common.required') }}</span>
    </label>

    <input
      id="password"
      type="password"
      class="form-input"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="$t('user.add.form.passwordPlaceholder')"
    />

    <p v-if="errors?.password?.[0]" class="error-message">
      {{ errors.password[0] }}
    </p>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  export type FormErrors = Record<string, string[]>;

  export default defineComponent({
    name: 'PasswordSection',

    props: {
      modelValue: {
        type: String,
        required: true,
      },

      /**
       * DRF validation errors
       * e.g. { password: ["..."] }
       */
      errors: {
        type: Object as PropType<FormErrors>,
        required: false,
        default: () => ({}),
      },
    },

    emits: ['update:modelValue'],
  });
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