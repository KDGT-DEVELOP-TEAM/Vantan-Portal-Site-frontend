<template>
  <div class="mobile-news-tabs-container">
    <!-- ===== Tabs Header ===== -->
    <div class="tabs-header">
      <div
        class="tab-item"
        :class="{ 'is-active-important': activeTab === 'important' }"
        @click="activeTab = 'important'"
      >
        <div class="important-label" />
        <h3 class="section-title important-title">重要なお知らせ</h3>
      </div>

      <div
        class="tab-item"
        :class="{ 'is-active-latest': activeTab === 'latest' }"
        @click="activeTab = 'latest'"
      >
        <div class="new-label" />
        <h3 class="section-title latest-title">新着情報</h3>
      </div>
    </div>

    <!-- ===== Tab Content ===== -->
    <div
      class="tab-content-wrapper"
      :class="{
        'border-important': activeTab === 'important',
        'border-latest': activeTab === 'latest'
      }"
    >
      <div class="news-list">
        <!-- Important -->
        <template v-if="activeTab === 'important'">
          <template v-if="importantNews.length > 0">
            <NewsCard
              v-for="item in importantNews"
              :key="item.id"
              :item="item"
              :can-edit="canEdit"
            />
          </template>
          <p v-else class="no-news-message">
            現在、重要なお知らせはありません。
          </p>
        </template>

        <!-- Latest -->
        <template v-else>
          <template v-if="latestNews.length > 0">
            <NewsCard
              v-for="item in latestNews"
              :key="item.id"
              :item="item"
              :can-edit="canEdit"
            />
          </template>
          <p v-else class="no-news-message">
            現在、新着情報はありません。
          </p>
        </template>
      </div>

      <!-- ===== View More ===== -->
      <div
        v-if="
          (activeTab === 'important' && importantNews.length > 0) ||
          (activeTab === 'latest' && latestNews.length > 0)
        "
        class="view-more-container"
      >
        <router-link
          :to="activeTab === 'important'
            ? '/news?type=important'
            : '/news?type=latest'"
          class="view-more-link"
        >
          View More
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import NewsCard from './NewsCard.vue';

  export default {
    name: 'MobileNewsTabs',
    components: {
      NewsCard,
    },
    props: {
      importantNews: {
        type: Array,
        required: true,
        default: () => []
      },
      latestNews: {
        type: Array,
        required: true,
        default: () => []
      },
      canEdit: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
        activeTab: 'important',
      };
    },
  };
</script>

<style scoped>
  /* ===============================
    ベースコンテナ
  ================================ */
  .mobile-news-tabs-container {
    position: relative;
    margin: 0 auto;
    background: #fff;
    border-radius: 10px;
    border: 0.5px solid #e2e2e2;
    padding-bottom: 10px;
    min-width: 320px;
    max-width: 480px;
    max-height: 494px;
    box-sizing: border-box;
    box-shadow:
      0 0 0 1.5px #e2e2e2,
      0 2.5px 10px rgba(127,185,34,0.07);
  }

  /* 外枠アクティブ色 */
  .border-important.mobile-news-tabs-container {
    border-color: #7FB922;
    box-shadow:
      0 0 0 2.5px #7FB922,
      0 2.5px 10px rgba(127,185,34,0.09);
  }

  .border-latest.mobile-news-tabs-container {
    border-color: #b3b2e7;
    box-shadow:
      0 0 0 2.5px #b3b2e7,
      0 2.5px 12px rgba(115,110,215,0.09);
  }

  /* ===============================
    タブヘッダー
  ================================ */
  .tabs-header {
    display: flex;
    background: #fff;
    border-radius: 10px 10px 0 0;
    min-height: 60px;
    z-index: 30;
  }

  /* ===============================
    タブ本体
  ================================ */
  .tab-item {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    background: #fff;
    height: 64px;
    min-width: 164px;
    border-radius: 10px 10px 0 0;
    border-bottom: 2.5px solid #e5f6c8;
    cursor: pointer;
    transition:
      transform 0.2s cubic-bezier(.6,.2,.33,1.18),
      box-shadow 0.18s,
      background 0.2s;
    position: relative;
  }

  /* 非アクティブ右端色 */
  .tab-item:last-child:not(.is-active-latest) {
    border-bottom-color: #b3b2e7;
  }

  /* アクティブ共通 */
  .tab-item.is-active-important,
  .tab-item.is-active-latest {
    height: 79.5px;
    min-height: 76px;
    margin-top: -13px;
    z-index: 32;
    background: #fff;
    box-shadow: none;
  }

  /* 重要タブ */
  .tab-item.is-active-important {
    border: 2px solid #7FB922;
    border-bottom: none;
    margin-bottom: -2.5px;
  }

  /* 新着タブ */
  .tab-item.is-active-latest {
    border: 2px solid #b3b2e7;
    border-bottom: none;
    margin-bottom: -2.5px;
  }

  /* ===============================
    ラベル
  ================================ */
  .important-label,
  .new-label {
    flex-shrink: 0;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 80% 80%;
    margin-left: 10px;
    margin-right: 11px;
  }

  .important-label {
    width: 42px;
    height: 42px;
    background-color: #7FB922;
    background-image: url("@/assets/image/image_look.png");
  }

  .tab-item.is-active-important .important-label {
    width: 44px;
    height: 44px;
  }

  .new-label {
    width: 40px;
    height: 40px;
    background-color: #736ED7;
    background-image: url("@/assets/image/image_new.png");
  }

  .tab-item.is-active-latest .new-label {
    width: 44px;
    height: 44px;
  }

  /* ===============================
    タイトル
  ================================ */
  .section-title {
    font-size: 17px;
    color: #666;
    font-weight: 500;
    display: flex;
    align-items: center;
    letter-spacing: 0.015em;
    user-select: none;
    transition: color 0.2s;
  }

  .tab-item.is-active-important .important-title,
  .tab-item.is-active-latest .latest-title {
    color: #222;
    font-weight: bold;
  }

  /* ===============================
    コンテンツエリア
  ================================ */
  .tab-content-wrapper {
    padding: 25px 8px 30px;
    background: #fff;
    border-radius: 0 0 10px 10px;
    min-height: 220px;
    border: 2px solid transparent;
    border-top-color: #fff;
    box-shadow: 0 2px 8px rgba(127,185,34,0.10);
  }

  /* コンテンツ枠色 */
  .tab-content-wrapper.border-important {
    border-color: #7FB922;
    box-shadow: 0 2px 10px rgba(176,221,108,0.16);
  }

  .tab-content-wrapper.border-latest {
    border-color: #b3b2e7;
    box-shadow: 0 2px 12px rgba(115,110,215,0.16);
  }

  /* ===============================
    ニュースリスト
  ================================ */
  .news-list {
    max-height: 370px;
    overflow-y: auto;
  }

  .news-list::-webkit-scrollbar {
    width: 7px;
    background: #f4f4fa;
  }

  .news-list::-webkit-scrollbar-thumb {
    background: #d0d0e0;
    border-radius: 5px;
  }

  /* ===============================
    View More
  ================================ */
  .view-more-container {
    position: relative;
    text-align: right;
  }

  .view-more-link {
    position: absolute;
    bottom: -52px;
    right: -12px;
    padding: 10px 15px;
    border-radius: 8px;
    border: 2px solid #FF9999;
    background: #fff;
    color: #ff5722;
    font-weight: 500;
    z-index: 50;
    transition: all 0.18s;
    text-decoration: none;
  }

  .view-more-link:hover {
    background: #FF9999;
    border-color: #E94040;
    color: #fff;
    text-decoration: none;
  }

  /* ===============================
    no-news
  ================================ */
  .no-news-message {
    text-align: center;
    color: #c1c1c1;
    padding: 30px 0;
    font-style: italic;
  }

  /* ===============================
    モバイル
  ================================ */
  @media (max-width: 410px) {
    .mobile-news-tabs-container {
      max-width: 100vw;
      border-radius: 0;
    }

    .tabs-header {
      border-radius: 0;
    }

    .tab-content-wrapper {
      border-radius: 0 0 16px 16px;
    }
  }
</style>