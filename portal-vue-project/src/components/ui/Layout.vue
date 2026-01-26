<template>
  <div class="layout-container">
    <Header @logout="handleLogout" />
    <main class="main-content">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script>
  import Header from './Header.vue'
  import Footer from './Footer.vue'
  import { clearAuth, getRefreshToken } from '@/store/authState'
  import { authApi } from '@/api/authApi'
  
  export default {
    name: 'Layout',
    components: {
      Header,
      Footer
    },
    methods: {
      async handleLogout() {
        try {
          const refreshToken = getRefreshToken();
          await authApi.logout(refreshToken);
        } catch (e) {
          console.warn('logout api failed', e);
        } finally {
          clearAuth();
          this.$router.replace('/login');
        }
      }
    }
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