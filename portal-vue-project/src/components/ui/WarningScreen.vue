<template>
    <div class="hamburger-menu">
      </div>
  </template>
  <script>
  export default { name: 'HamburgerMenu' }
  </script>
  
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
  
  <template>
    <div class="screen-message warning">
      <slot></slot>
    </div>
  </template>
  <script>
  export default { name: 'WarningScreen' }
  </script>
  
  <template>
    <div class="screen-message caution">
      <slot></slot>
    </div>
  </template>
  <script>
  export default { name: 'CautionScreen' }
  </script>