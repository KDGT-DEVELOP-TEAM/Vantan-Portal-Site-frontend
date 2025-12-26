<template>
  <div class="news-list-item" @click="emit('view-detail', news.id)">
    <div class="item-content">
      <h3 class="item-title">{{ news.title }}</h3>
      <p class="item-date">{{ formatDate(news.created_at) }}</p>
    </div>
    <div v-if="isAdmin" class="item-actions">
      <button class="edit-btn" @click.prevent.stop="emit('edit', news.id)">
        <span class="material-symbols-outlined edit-icon">border_color</span>
      </button>
      <button class="delete-btn" @click.prevent.stop="emit('delete', news.id)">
        <span class="material-symbols-outlined delete-icon">delete</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  news: {
    type: Object,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view-detail', 'edit', 'delete']);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};
</script>

<style scoped>
.news-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}
.news-list-item:hover {
  background-color: #f5b9b97a;
}
.item-content {
  flex-grow: 1;
  padding-right: 100px; /* Space for buttons */
}
.item-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  color: #F1494C;
}
.item-date {
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
}

.item-actions {
  display: flex;
  gap: 5px;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}
  
.item-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  transition: background-color 0.2s;
  line-height: 1;
}
  
.material-symbols-outlined {
  color: white;
  font-size: 18px;
  border-radius: 5px;
  padding: 0 5px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
  
.edit-icon {
  color: white;
  background-color: #7FB922;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; 
}
  
.delete-icon {
  color: white;
  background-color: #F1494C;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
  
.edit-icon:hover {
  background-color: white;
  color: #7FB922;
  border: 1px solid #7FB922;
}

.delete-icon:hover {
  background-color: white;
  color: #F1494C;
  border: 1px solid #F1494C;
}
</style>