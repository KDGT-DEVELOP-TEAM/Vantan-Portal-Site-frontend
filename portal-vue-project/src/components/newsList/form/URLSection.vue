<template>
  <div class="form-section">
    <label for="news-url" class="form-label">
      関連URL <span class="optional">(任意)</span>
    </label>
    <input 
      id="news-url" 
      type="url" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)" 
      placeholder="https://example.com/related-info"
      class="form-input"
      :class="{ 'is-error': isError }"
    >
    <p class="help-text">関連するウェブサイトのURLをフルパスで入力してください。</p>
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
    default: '有効なURL形式で入力してください。',
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* TitleSection.vueと共通のスタイルを使用 */
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

.optional {
  color: #555;
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

.help-text {
  font-size: 0.85rem;
  color: #777;
  margin-top: 5px;
}

.error-text {
  color: #cc0000;
  font-size: 0.9rem;
  margin-top: 5px;
}
</style>