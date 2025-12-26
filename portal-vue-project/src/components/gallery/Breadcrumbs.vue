<template>
  <div class="breadcrumbs-container">
    <a 
      v-for="(item, index) in items" 
      :key="index" 
      :href="item.path" 
      class="breadcrumb-item"
      :class="{ 'is-active': index === items.length - 1 }"
    >
      {{ item.label }}
      <span v-if="index < items.length - 1" class="separator">/</span>
    </a>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.breadcrumbs-container {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
  padding: 10px 0;
  
}

@media (max-width: 1124px) {
  .breadcrumbs-container {
    display: none;
  }
}


.breadcrumb-item {
  text-decoration: none;
  color: #333;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #f15b5b;
}

.is-active {
  color: #f15b5b;
  font-weight: bold;
  pointer-events: none;
}

.separator {
  margin: 0 8px;
  color: #aaa;
}

</style>