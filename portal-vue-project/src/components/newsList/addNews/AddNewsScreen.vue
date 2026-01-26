<template>
  <Layout :user-role="userRole" :current-page="$t('page.home')" @logout="$emit('logout')">
    <div class="news-create-screen">
      <div class="content-wrapper">
        <h1 class="page-title">{{ $t('news.create.title') }}</h1>
        <Breadcrumbs :items="breadcrumbs" />

        <AddNewsForm
          :initial-data="initialNewsData"
          :is-loading="isLoading"
          @submit-data="handleCreate"
        />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Breadcrumbs from '../Breadcrumbs.vue';
import AddNewsForm from './AddNewsForm.vue';
import { createNews } from '@/api/news';
import Layout from '@/components/ui/Layout.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const router = useRouter();
const { t } = useI18n();

const isLoading = ref(false);

// ✅ 親が誤って書き換える事故を防ぐ。AddNewsForm側でコピーして使うのでfreezeでOK
const initialNewsData = Object.freeze({
  title: '',
  content: '',
  importance: false,
  attachments: [],
});

const breadcrumbs = computed(() => [
  { label: t('page.home'), path: '/home' },
  { label: t('news.create.breadcrumb.news'), path: '/news' },
  { label: t('news.create.breadcrumb.create'), path: '/news/create' },
]);

const handleCreate = async (formData) => {
  isLoading.value = true;
  try {
    await createNews(formData);
    console.log(t('news.create.success'));
    router.push('/news');
  } catch (error) {
    console.error(t('news.create.failed'), error?.response || error);
    // TODO: 納期後に toast/snackbar 表示に置換するなら、ここに user-facing error state を追加
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.news-create-screen {
  min-height: calc(100vh - 100px);
  background-color: #f7f7f7;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 900px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
</style>
