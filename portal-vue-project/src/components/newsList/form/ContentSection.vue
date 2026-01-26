<template>
  <div class="form-section">
    <label for="news-content" class="form-label">
      {{ t('news.form.content.label') }}
      <span class="required">{{ t('form.required') }}</span>
    </label>

    <textarea
      id="news-content"
      v-model="content"
      :placeholder="t('news.form.content.placeholder')"
      class="form-textarea"
      :class="{ 'is-error': isError }"
      rows="10"
      required
    ></textarea>

    <p v-if="isError" class="error-text">{{ resolvedErrorText }}</p>
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
   * 親でバリデーション文言を制御したい場合に渡す
   * 未指定なら i18n のデフォルト文言を使う
   */
  errorText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const resolvedErrorText = computed(() => {
  return props.errorText?.trim() ? props.errorText : t('news.form.content.requiredError');
});
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

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s;
  resize: vertical;
}

.form-textarea:focus {
  border-color: #f15b5b;
  outline: none;
  box-shadow: 0 0 5px rgba(241, 91, 91, 0.3);
}

.form-textarea.is-error {
  border-color: #cc0000;
}

.error-text {
  color: #cc0000;
  font-size: 0.9rem;
  margin-top: 5px;
}
</style>
