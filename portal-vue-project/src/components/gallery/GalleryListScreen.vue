<template>
  <Layout :user-role="userRole" :current-page="$t('page.home')" @logout="$emit('logout')">
    <div class="gallery-screen">
      <div class="content-wrapper">
        <Breadcrumbs :items="breadcrumbs" />
        <GalleryList :user-role="userRole" />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Layout from '../ui/Layout.vue';
import Breadcrumbs from './Breadcrumbs.vue';
import GalleryList from './GalleryList.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const { t } = useI18n();

// パンくずリスト（i18n追従のため computed）
const breadcrumbs = computed(() => [
  { label: t('page.home'), path: '/home' },
  { label: t('breadcrumb.gallery'), path: '/gallery' },
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
