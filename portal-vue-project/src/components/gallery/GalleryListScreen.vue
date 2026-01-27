<template>
  <Layout :current-page="$t('page.home')" @logout="$emit('logout')">
    <div class="gallery-screen">
      <div class="content-wrapper">
        <Breadcrumbs :items="breadcrumbs" />
        <!-- 必要なパーミッションを判定して渡す -->
        <GalleryList
          :user-permissions="userPermissions"
        />
      </div>
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
  </Layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/utils/permission';
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import Layout from '../ui/Layout.vue';
import Breadcrumbs from './Breadcrumbs.vue';
import GalleryList from './GalleryList.vue';

const { t } = useI18n();

// パーミッション判定をrefで保持
const canmanage = ref(hasPermission('user_manage'));
const showModal = ref(false);
// パンくずリスト（i18n追従のため computed）
const breadcrumbs = computed(() => [
  { label: t('page.home'), path: '/home' },
  { label: t('breadcrumb.gallery'), path: '/gallery' },
]);
const handleModalSelection = (option) => {
  showModal.value = false;
};
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

@media (max-width: 1124px) {
  .content-wrapper {
    margin-top: 40px;
  }
  .content-wrapper h1 {
    display: none;
  }
}
</style>
