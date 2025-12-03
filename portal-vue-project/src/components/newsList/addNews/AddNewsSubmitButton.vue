<template>
  <button 
    type="submit" 
    class="submit-button add-button" 
    :disabled="isLoading"
    @click.prevent="$emit('submit')"
  >
    <span v-if="isLoading" class="spinner"></span>
    {{ isLoading ? '投稿中...' : 'お知らせを投稿' }}
  </button>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['submit']);
</script>

<style scoped>
.submit-button {
  width: 100%;
  padding: 15px;
  background-color: #f15b5b; /* アクセントカラー */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s, transform 0.1s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.submit-button:hover:not(:disabled) {
  background-color: #e04b4b;
}

.submit-button:active:not(:disabled) {
  transform: translateY(1px);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

/* ローディングスピナー (CSSのみで実装) */
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>