<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="news-screen">
      <div class="content-wrapper">
        <h1 class="page-title">お知らせ</h1>
        <Breadcrumbs :items="breadcrumbs" />
        <NewsListSection :is-admin="isAdmin" />
        <!-- 管理者用グローバル追加ボタン -->
        <button
          v-if="hasPermission('user_manage')"
          class="global-add-button"
          @click="showModal = true"
          type="button"
        >
          <span class="material-symbols-outlined icon-plus">add</span>
        </button>

        <AddOptionsModal
          v-if="hasPermission('user_manage') && showModal"
          @close="showModal = false"
          @select-option="handleModalSelection"
        />
        </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from '../ui/Layout.vue';
import { ref, computed } from 'vue'; // Import computed
import Breadcrumbs from './Breadcrumbs.vue';
import NewsListSection from './NewsListSection.vue';
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import { hasPermission } from '@/utils/permission';

// props (親コンポーネントからユーザー権限を受け取る想定)
const props = defineProps({
});
const showModal = ref(false);
const isAdmin = computed(() => {
  // 例: 編集 or 削除権限があれば true に
  return hasPermission('user_manage');
});

// パンくずリストのデータ
const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
]);

const handleModalSelection = (option) => {
  showModal.value = false;
};
</script>

<style scoped>
.news-screen {
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
  color: #f15b5b;
  margin-bottom: 5px;
  display: inline-block;
  padding-bottom: 5px;
}

/* --- グローバル追加ボタン --- */
.global-add-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #ff0000;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 0, 0, 0.4);
  transition: background-color 0.3s, transform 0.3s;
  z-index: 100;
}

.global-add-button:hover {
  background-color: white;
  transform: scale(1.05);
  border: 2px solid #f1494c;
  color: #f1494c;
}

.global-add-button:hover .icon-plus {
  color: #f1494c;
}

.icon-plus {
  color: white;
  font-size: 2rem;
  line-height: 1;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

@media (min-width: 1124px) {
  .news-screen {
    margin-top: 90px;
  }
}
</style>