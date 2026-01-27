<template>
  <button 
    class="add-news-button" 
    @click="$emit('click')"
  >
    <span class="material-symbols-outlined">add</span>
  </button>
</template>

<script setup>
// イベント定義
defineEmits(['click']);
</script>

<style scoped>
.add-news-button {
  width: 45px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background-color: #f15b5b; /* アクセントカラー */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap; /* テキストが折り返されないように */
  z-index: 1000;
}

.add-news-button:hover {
  background-color: #e04b4b;
}

.add-news-button:active {
  transform: translateY(1px);
}

.material-symbols-outlined {
  font-size: 18px;
}
</style>