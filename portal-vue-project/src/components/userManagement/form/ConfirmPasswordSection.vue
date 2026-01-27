<template>
  <div class="form-section">
    <label for="passwordConfirmation">
      {{ $t('user.add.confirmPasswordLabel') }}
      <span class="required">{{ $t('common.required') }}</span>
    </label>

    <input
      id="passwordConfirmation"
      type="password"
      class="form-input"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="$t('user.add.form.confirmPasswordPlaceholder')"
    />

    <p v-if="errors?.password_confirmation?.[0]" class="error-message">
      {{ errors.password_confirmation[0] }}
    </p>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  export type FormErrors = Record<string, string[]>;

  export default defineComponent({
    name: 'ConfirmPasswordSection',
    props: {
      modelValue: {
        type: String,
        required: true,
      },
      /**
       * DRF validation errors
       * e.g. { password_confirmation: ["..."] }
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