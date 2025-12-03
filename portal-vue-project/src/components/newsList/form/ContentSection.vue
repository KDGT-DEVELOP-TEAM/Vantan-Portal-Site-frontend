<template>
  <div class="form-section">
    <label for="news-content" class="form-label">
      本文 <span class="required">(必須)</span>
    </label>
    <textarea 
      id="news-content" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)" 
      placeholder="お知らせの本文をMarkdownまたはプレーンテキストで入力してください"
      class="form-textarea"
      :class="{ 'is-error': isError }"
      rows="10"
      required
    ></textarea>
    <p v-if="isError" class="error-text">{{ errorText }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  isError: {
    type: Boolean,
    default: false,
  },
  errorText: {
    type: String,
    default: '本文は必須項目です。',
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* TitleSection.vueと共通のスタイルは省略し、固有のもののみ記述 */
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
  resize: vertical; /* 縦方向のみリサイズ可能 */
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