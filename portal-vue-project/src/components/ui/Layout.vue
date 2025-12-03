<template>
  <div class="layout-container">
    <Header :user-role="userRole" :current-page="currentPage" @logout="$emit('logout')" /> 
    <main class="main-content">
      <slot></slot>
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue';
import Footer from './Footer.vue';

export default {
  name: 'Layout',
  components: {
    Header,
    Footer
  },
  props: {
    userRole: {
      type: String,
      required: true
    },
    // 修正点: currentPage プロパティを受け取るように追加
    currentPage: {
      type: String,
      required: true
    }
  },
  emits: ['logout'],
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex-grow: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>