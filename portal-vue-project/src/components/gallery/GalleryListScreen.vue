<template>
  <Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
    <div class="gallery-screen">
      <div class="content-wrapper">
        <h1 class="page-title">ギャラリー</h1>
        <Breadcrumbs :items="breadcrumbs" />
        <GalleryList :is-admin="isAdmin" />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from '../ui/Layout.vue';
import { ref } from 'vue';
import Breadcrumbs from './Breadcrumbs.vue';
import GalleryList from './GalleryList.vue';

// props (親コンポーネントからユーザー権限を受け取る想定)
const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const isAdmin = ref(props.userRole === 'admin');

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
}

.content-wrapper {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  border-bottom: 3px solid #f15b5b;
  display: inline-block;
  padding-bottom: 5px;
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