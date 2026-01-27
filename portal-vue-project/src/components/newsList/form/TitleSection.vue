<template>
  <div class="form-section">
    <label for="news-title" class="form-label">
      {{ t('news.form.title.label') }}
      <span class="required">{{ t('form.required') }}</span>
    </label>

    <input
      id="news-title"
      type="text"
      :value="modelValue"
      @input="onInput"
      :placeholder="t('news.form.title.placeholder')"
      class="form-input"
      :class="{ 'is-error': isError }"
      :aria-invalid="isError ? 'true' : 'false'"
      :aria-describedby="isError ? 'news-title-error' : undefined"
      required
    >

    <p v-if="isError" id="news-title-error" class="error-text">
      {{ resolvedErrorText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  isError: {
    type: Boolean,
    default: false,
  },
  /**
   * 親から独自文言を渡したい場合に使用（未指定なら i18n デフォルト）
   */
  errorText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const resolvedErrorText = computed(() => {
  return props.errorText?.trim()
    ? props.errorText
    : t('news.form.title.requiredError');
});

const onInput = (event) => {
  const value = event?.target?.value ?? '';
  emit('update:modelValue', value);
};
</script>

<style scoped>
.form-section {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  text-align: left;
  font-size: 1rem;
  margin-bottom: 5px;
  color: #333;
  font-weight: bold;
}

.required {
  color: #f15b5b;
  font-weight: normal;
  font-size: 0.85rem;
  margin-left: 5px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #f15b5b;
  outline: none;
  box-shadow: 0 0 5px rgba(241, 91, 91, 0.3);
}

.form-input.is-error {
  border-color: #cc0000;
}

.error-text {
  color: #cc0000;
  font-size: 0.9rem;
  margin-top: 5px;
}
</style>
