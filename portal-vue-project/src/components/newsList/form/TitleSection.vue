<template>
  <div class="form-section">
    <label for="news-title" class="form-label">
      タイトル <span class="required">(必須)</span>
    </label>
    <input 
      id="news-title" 
      type="text" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)" 
      placeholder="お知らせのタイトルを入力してください"
      class="form-input"
      :class="{ 'is-error': isError }"
      required
    >
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
    default: 'タイトルは必須項目です。',
  },
});

defineEmits(['update:modelValue']);
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
  color: #f15b5b; /* 赤色 */
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