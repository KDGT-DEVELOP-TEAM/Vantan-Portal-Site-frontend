<template>
    <Layout
      :user-role="userRole"
      :current-page="$t('pages.calendar.title')"
      @logout="$emit('logout')"
    >
      <div class="page-container">
        <nav class="breadcrumb" v-if="$route.query.from === 'widget'">
          <router-link to="/home" class="breadcrumb-item">
            {{ $t('common.breadcrumb.home') }}
          </router-link>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-item current-page">
            {{ $t('pages.calendar.title') }}
          </span>
        </nav>
  
        <h2 class="page-header">
          {{ $t('pages.calendar.title') }}
        </h2>
  
        <div v-if="apiError" class="error-message" role="alert">
          {{ $t('pages.calendar.errorFetchPrefix') }} {{ apiError }}
        </div>
  
        <div v-else-if="loading" class="loading-message" role="status" aria-live="polite">
          <p>{{ $t('pages.calendar.loading') }}</p>
        </div>
  
        <div v-else-if="calendarUrl" class="calendar-embed-wrapper">
          <iframe
            :src="calendarUrl"
            frameborder="0"
            scrolling="no"
            class="embedded-calendar"
            :title="$t('pages.calendar.iframeTitle')"
          ></iframe>
        </div>
  
        <div v-else class="empty-message">
          {{ $t('pages.calendar.empty') }}
        </div>
  
        <button
          v-if="userRole === 'admin'"
          class="global-add-button"
          @click="showModal = true"
          type="button"
          :aria-label="$t('common.actions.add')"
        >
          <span class="material-symbols-outlined icon-plus" aria-hidden="true">add</span>
        </button>
  
        <AddOptionsModal
          v-if="userRole === 'admin' && showModal"
          @close="showModal = false"
          @select-option="handleModalSelection"
        />
      </div>
    </Layout>
  </template>
  
  <script>
  import AddOptionsModal from '../ui/AddOptionsModal.vue'
  import Layout from '../ui/Layout.vue'
  import { fetchCalendarUrlApi } from '@/api/calendar'
  
  export default {
    name: 'CalendarSection',
    components: {
      Layout,
      AddOptionsModal,
    },
    props: {
      userRole: { type: String, default: 'viewer' },
    },
    data() {
      return {
        loading: false,
        apiError: null,
        calendarUrl: null, // APIから取得したURLを保持
        showModal: false,
      }
    },
    mounted() {
      this.fetchCalendarUrl()
    },
    methods: {
      async fetchCalendarUrl() {
        this.loading = true
        this.apiError = null
        this.calendarUrl = null
  
        const token = localStorage.getItem('accessToken')
  
        try {
          const response = await fetchCalendarUrlApi(token)
          const urlFromApi = response?.data?.calendar_url
  
          if (urlFromApi) {
            this.calendarUrl = urlFromApi
          } else {
            this.apiError = this.$t('pages.calendar.apiMissingUrl')
          }
        } catch (err) {
          // 本番納品では console を抑えることも検討（ただし障害調査用に warn で残すのは現実的）
          // eslint-disable-next-line no-console
          console.warn('Calendar API error:', err?.response || err)
  
          this.apiError = this.$t('pages.calendar.apiFailed')
          this.calendarUrl = null
        } finally {
          this.loading = false
        }
      },
  
      handleModalSelection(option) {
        // 仕様確定後に $router.push() 等で遷移実装
        // 本番ログはノイズになりやすいので必要なら DEV のみ表示
        // if (import.meta.env.DEV) console.log(option)
  
        this.showModal = false
      },
    },
  }
  </script>
  
  <style scoped>
  /* ====================================
     パンくずリストのスタイル
     ==================================== */
  .breadcrumb {
    position: fixed;
    top: 18%;
    z-index: 100;
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: #6c757d;
    text-align: left;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
  }
  @media (max-width: 1123px) {
    .breadcrumb {
      top: 8%;
    }
  }
  
  .breadcrumb-item {
    text-decoration: none;
    color: #6c757d;
    transition: color 0.2s;
  }
  
  .breadcrumb-item:hover {
    color: #f1494c;
  }
  
  .current-page {
    font-weight: bold;
    color: #f1494c;
  }
  
  .breadcrumb-separator {
    margin: 0 8px;
    color: #adb5bd;
  }
  
  /* ====================================
     ユーザー指定のデザインスタイル
     ==================================== */
  .page-container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
  }
  
  .header-with-breadcrumb {
    text-align: left;
    font-size: 24px;
    padding: 0 0 10px 0;
    font-weight: normal;
    color: #f1494c;
    margin-bottom: 30px;
  }
  
  .page-header {
    text-align: left;
    font-size: 24px;
    margin-top: 15%;
    padding: 0 0 10px 0;
    font-weight: normal;
    color: #f1494c;
    margin-bottom: 30px;
  }
  
  /* 埋め込みコンテナ */
  .calendar-embed-wrapper {
    position: relative;
    width: 100%;
    border: 1px solid #ff4444;
    padding-top: 75%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0;
    background-color: #fff;
    right: 1%;
  }
  @media (max-width: 767px) {
    .calendar-embed-wrapper {
      padding-top: 94%; /* 正方形 */
      box-sizing: border-box;
    }
  }
  
  /* iframe のスタイル */
  .embedded-calendar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  
  /* 状態表示 */
  .error-message,
  .loading-message,
  .empty-message {
    padding: 20px;
    margin: 20px 0;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }
  .error-message {
    background-color: #fdd;
    color: #cc0000;
  }
  .loading-message {
    background-color: #eef;
    color: #007bff;
  }
  .empty-message {
    background-color: #f7f7f7;
    color: #555;
    font-weight: normal;
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
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  </style>
  