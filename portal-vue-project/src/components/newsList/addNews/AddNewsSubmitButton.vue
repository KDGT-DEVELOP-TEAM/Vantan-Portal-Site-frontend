<template>
  <button 
    type="submit" 
    class="action-button submit-button"
    :disabled="isLoading"
  >
    <span v-if="isLoading" class="spinner"></span>
    <span v-else>{{ submitLabel }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: '送信',
  }
});
</script>

<style scoped>
.submit-button {
  background-color: #F1494C; /* 赤系 */
  color: white;
  max-height: 45px;
  margin-top: 30px;
}

.submit-button:hover:not(:disabled) {
  background-color: #c43b3d;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>