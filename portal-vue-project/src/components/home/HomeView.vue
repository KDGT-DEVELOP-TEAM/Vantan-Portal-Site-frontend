<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="home-view">
      <h2 class="page-header">{{ $t('page.home') }}</h2>

      <div v-if="apiError" class="error-message">
        {{ $t('common.fetchFailed') }}: {{ apiError }}
      </div>

      <!-- PC表示 -->
      <div v-if="!isMobile && !loading && !apiError" class="dashboard-grid">
        <ImportantNewsSection
          :news-list="importantNews"
          :can-edit="hasPermission('news_manage')"
        />
        <LatestNewsSection
          :news-list="latestNews"
          :can-edit="hasPermission('news_manage')"
        />
      </div>

      <!-- モバイル表示 -->
      <MobileNewsTabs
        v-else-if="isMobile && !loading && !apiError"
        :important-news="importantNews"
        :latest-news="latestNews"
        :can-edit="hasPermission('news_manage')"
      />

      <div v-else-if="loading" class="loading-message">
        {{ $t('home.loading') }}
      </div>

      <CalendarSection :calendar-url="calendarUrl" />

      <!-- 管理者用グローバル追加ボタン -->
      <button
        v-if="hasPermission('user_manage')"
        class="global-add-button"
        @click="showModal = true"
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

<script>
import Layout from '../ui/Layout.vue';
import LatestNewsSection from './LatestNewsSection.vue';
import ImportantNewsSection from './ImportantNewsSection.vue';
import CalendarSection from './CalendarSection.vue';
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import MobileNewsTabs from './MobileNewsTabs.vue';
import { hasPermission } from '@/utils/permission';
import { homeApi } from '@/api/homeApi';

export default {
  name: 'HomeView',
  components: {
    Layout,
    LatestNewsSection,
    ImportantNewsSection,
    CalendarSection,
    AddOptionsModal,
    MobileNewsTabs,
  },
  emits: ['logout'],
  data() {
    return {
      latestNews: [],
      importantNews: [],
      calendarUrl: '',
      loading: true,
      apiError: null,
      showModal: false,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth <= 783;
    },
  },
  mounted() {
    this.fetchHomePageData();
    window.addEventListener('resize', this.updateWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWidth);
  },
  methods: {
    hasPermission,
    updateWidth() {
      this.windowWidth = window.innerWidth;
    },
    formatDate(timestamp) {
      if (!timestamp) return this.$t('common.unknownDate');
      try {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      } catch (e) {
        console.error('日付のパースに失敗:', timestamp, e);
        return this.$t('common.unknownDate');
      }
    },
    async fetchHomePageData() {
      this.loading = true;
      this.apiError = null;

      try {
        const { data } = await homeApi.fetchHomePageData();

        this.latestNews = (data.new_news || []).map((item) => ({
          id: item.id,
          title: item.title,
          date: this.formatDate(item.updated_at),
          isDimmed: item.is_read || false,
        }));

        this.importantNews = (data.important_news || []).map((item) => ({
          id: item.id,
          title: item.title,
          date: this.formatDate(item.updated_at),
          isDimmed: item.is_read || false,
        }));

        // ダミーURLは入れない（CalendarSection側でプレースホルダー表示）
        this.calendarUrl = data.calendar_url || '';
      } catch (err) {
        console.error('ホームAPIエラー:', err);
        // 表示文言はi18n、詳細はapiErrorに保持
        this.apiError = this.$t('home.apiError');
      } finally {
        this.loading = false;
      }
    },
    handleModalSelection(option) {
      // option は i18n ではなく「固定キー」で受け取る前提（例: 'news' 等）
      // ここでルーティング実装するのが納品としてベター
      console.log(`【管理者機能】${option} が選択されました`);
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 30px;
  margin-top: 100px;
}

.home-view {
  padding: 20px 40px;
  min-height: 100vh;
}

.error-message,
.loading-message {
  padding: 15px;
  margin: 20px 0;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
}

.error-message {
  background-color: #fdd;
  color: #cc0000;
}

.loading-message {
  background-color: #eef;
  color: #007bff;
}

.page-header {
  text-align: left;
  font-size: 24px;
  margin-top: 15%;
  padding: 0 0 10px 0;
  margin-top: 15%;
  padding: 0 0 10px 0;
  font-weight: normal;
  color: #f1494c;
  margin-bottom: 30px;
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

@media (max-width: 783px) {
  .home-view {
    padding: 20px 20px;
  }

  .global-add-button {
    bottom: 20px;
    right: 20px;
  }
}
</style>