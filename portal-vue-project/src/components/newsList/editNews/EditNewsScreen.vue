<template>
  <Layout :user-role="userRole" :current-page="$t('page.home')" @logout="$emit('logout')">
    <div class="news-edit-screen">
      <div class="content-wrapper">
        <h1 class="page-title">{{ $t('news.editScreen.title') }}</h1>
        <Breadcrumbs :items="breadcrumbs" />
        <EditNewsForm :news-id="newsId" @news-fetched="handleNewsFetched" />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Breadcrumbs from '../Breadcrumbs.vue';
import EditNewsForm from './EditNewsForm.vue';
import Layout from '@/components/ui/Layout.vue';

const props = defineProps({
  userRole: {
    type: String,
    required: false,
    default: 'viewer',
  },
});

const route = useRoute();
const { t } = useI18n();

const newsTitle = ref('');

// route.params.id は string | string[] | undefined の可能性があるので必ず文字列化
const newsId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? String(id[0] ?? '') : String(id ?? '');
});

const handleNewsFetched = (title) => {
  newsTitle.value = title || '';
};

const breadcrumbs = computed(() => {
  const id = newsId.value;

  return [
    { label: t('page.home'), path: '/home' },
    { label: t('news.editScreen.breadcrumb.news'), path: '/news' },
    {
      label: newsTitle.value || t('news.editScreen.breadcrumb.idFallback', { id }),
      path: `/news/${id}`,
    },
    { label: t('news.editScreen.breadcrumb.edit'), path: `/news/${id}/edit` },
  ];
});
</script>

<style scoped>
.news-edit-screen {
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
  color: #F1494C;
  margin-bottom: 5px;
  display: inline-block;
  padding-bottom: 5px;
}

@media (min-width: 1124px) {
  .page-title {
    margin-top: 90px;
  }
}
</style>
