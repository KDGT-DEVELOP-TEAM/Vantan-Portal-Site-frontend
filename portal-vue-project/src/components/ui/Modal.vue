<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: { isOpen: Boolean }
}
</script>