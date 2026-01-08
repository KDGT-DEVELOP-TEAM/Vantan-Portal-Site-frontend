<template>
  <Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
    <div class="gallery-screen">
      <div class="content-wrapper">
        <Breadcrumbs :items="breadcrumbs" />
        <GalleryList :user-role="userRole" />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from '../ui/Layout.vue';
import { ref, computed } from 'vue';
import Breadcrumbs from './Breadcrumbs.vue';
import GalleryList from './GalleryList.vue';

// props (親コンポーネントからユーザー権限を受け取る想定)
const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const isAdmin = computed(() => props.userRole === 'admin');

// パンくずリストのデータ
const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'ギャラリー', path: '/gallery' },
]);
</script>

<style scoped>
.gallery-screen {
  min-height: calc(100vh - 100px); 
  background-color: #f7f7f7;
  padding: 20px 0;
  margin-top: 100px;
}

.content-wrapper {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 1124px) {
  .content-wrapper {
      margin-top: 40px;
  }
  .content-wrapper h1 {
      display: none;
  }
}
</style>