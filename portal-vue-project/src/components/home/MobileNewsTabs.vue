<template>
  <div class="mobile-news-tabs-container">
    
    <div class="tabs-header">
      
      <div 
        class="tab-item" 
        :class="{'is-active-important': activeTab === 'important'}"
        @click="activeTab = 'important'"
      >
        <div class="important-label"></div>
        <h3 class="section-title important-title">重要なお知らせ</h3>
      </div>
      
      <div 
        class="tab-item" 
        :class="{'is-active-latest': activeTab === 'latest'}"
        @click="activeTab = 'latest'"
      >
        <div class="new-label"></div>
        <h3 class="section-title latest-title">新着情報</h3>
      </div>
    </div>

    <!-- 動的クラスで枠線カラーを切り替え -->
    <div
      class="tab-content-wrapper"
      :class="{
        'border-important': activeTab === 'important',
        'border-latest': activeTab === 'latest'
      }"
    >
      <div class="news-list">
        
        <template v-if="activeTab === 'important'">
          <template v-if="importantNews && importantNews.length > 0">
            <NewsCard 
              v-for="item in importantNews" 
              :key="item.id" 
              :item="item" 
              :user-role="userRole" 
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
            />
          </template>
          <p v-else class="no-news-message">現在、重要なお知らせはありません。</p>
        </template>
        
        <template v-else-if="activeTab === 'latest'">
          <template v-if="latestNews && latestNews.length > 0">
            <NewsCard 
              v-for="item in latestNews" 
              :key="item.id" 
              :item="item" 
              :user-role="userRole" 
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
            />
          </template>
          <p v-else class="no-news-message">現在、新着情報はありません。</p>
        </template>
        
      </div>

      <div 
        v-if="(activeTab === 'important' && importantNews.length > 0) || (activeTab === 'latest' && latestNews.length > 0)" 
        class="view-more-container"
      >
        <a href="#" class="view-more-link">View More</a>
      </div>
    </div>
    
  </div>
</template>

<script>
import NewsCard from './NewsCard.vue';

export default {
    name: 'MobileNewsTabs',
    components: { NewsCard },
    props: {
        importantNews: {
            type: Array,
            required: true,
        },
        latestNews: {
            type: Array,
            required: true,
        },
        userRole: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            activeTab: 'important', // 初期表示は「重要なお知らせ」
        };
    },
    emits: ['edit', 'delete']
}
</script>

<style scoped>
/* ------------------------------------------- */
/* MobileNewsTabs.vue - デザイン準拠           */
/* ------------------------------------------- */

/* ベースコンテナ: タブ全体を囲む */
.mobile-news-tabs-container {
  margin-top: 0;
  position: relative;
  background: #fff;
  border-radius: 10px;
  /* デフォルトではアクティブカラーを外しておく */
  border: 0.5px solid #e2e2e2;
  padding-bottom: 10px;
  min-width: 320px;
  max-width: 480px;
  max-height: 494px;
  box-sizing: border-box;
  box-shadow: 0 0 0 1.5px #e2e2e2, 0 2.5px 10px 0 rgba(127,185,34,0.07);

  /* 中央寄せ用追加 */
  margin-left: auto;
  margin-right: auto;
}

/* アクティブなタブ(重要)のとき外枠ボーダー色をアクティブカラーへ */
.border-important.mobile-news-tabs-container {
  border-color: #7FB922 !important;
  box-shadow: 0 0 0 2.5px #7FB922, 0 2.5px 10px 0 rgba(127,185,34,0.09);
}

/* アクティブなタブ(新着)のとき外枠ボーダー色をアクティブカラーへ */
.border-latest.mobile-news-tabs-container {
  border-color: #b3b2e7 !important;
  box-shadow: 0 0 0 2.5px #b3b2e7, 0 2.5px 12px 0 rgba(115, 110, 215, 0.09);
}

/* タブヘッダー */
.tabs-header {
  display: flex;
  position: relative;
  top: 0;
  left: 0;
  z-index: 30;
  width: 100%;
  background: #fff;
  justify-content: flex-start;
  border-radius: 10px 10px 0 0;
  box-sizing: border-box;
  gap: 0;
  min-height: 60px;
  /* ↑ 全体形状を角丸へ */
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: left;
  background: #fff;
  border: none;
  border-radius: 10px 10px 0 0;
  box-sizing: border-box;
  cursor: pointer;
  margin-right: 0;
  margin-left: 0;
  transition:
    transform 0.2s cubic-bezier(.6,.2,.33,1.18),
    box-shadow 0.18s,
    background 0.2s;
  position: relative;
  height: 64px;
  min-width: 164px;
  flex: 1 0 0;
  text-align: left;
  border-bottom: 2.5px solid #e5f6c8;
}

.tab-item.is-active-important,
.tab-item.is-active-latest {
  box-shadow: none;
  background: #fff;
  z-index: 31;
  height: 79px; /* もう少し縦長に */
  min-height: 76px;
  margin-top: -13px;
}
.tab-item:last-child:not(.is-active-latest) {
  border-bottom: 2px solid #b3b2e7;
}
/* アクティブ用のアウトラインを、タブとボックスがひと繋がりに見えるよう調整 */
.tab-item.is-active-important {
  border: 2px solid #7FB922 !important;    /* タブ外枠色 */
  border-bottom: none !important;           /* タブ下を消すことでコンテンツ枠線と一体化 */
  background: #fff;
  position: relative;
  z-index: 32;
  /* タブと内容枠線がきっちり繋がるよう、下方向にちょいはみ出させて段差消す */
  margin-bottom: -2.5px;
}

.tab-item.is-active-latest {
  border: 2px solid #b3b2e7 !important;   /* タブ外枠色 */
  border-bottom: none !important;           /* タブ下を消すことでコンテンツ枠線と一体化 */
  background: #fff;
  position: relative;
  z-index: 32;
  margin-bottom: -2.5px;
}

/* コンテンツ枠の上ボーダーで"タブ下"にきっちり重ねて白で隠すテク */
.tab-content-wrapper.border-important {
  border-top-color: #fff !important;
  border-right-color: #7FB922 !important;
  border-bottom-color: #7FB922 !important;
  border-left-color: #7FB922 !important;
}

.tab-content-wrapper.border-latest {
  border-top-color: #fff !important;
  border-right-color: #b3b2e7 !important;
  border-bottom-color: #b3b2e7 !important;
  border-left-color: #b3b2e7 !important;
}
/* ↑ボックスの上部を白にすることでタブ下線ときっちり繋げる */
/* さらにタブItemのmargin-bottom調整で隙間完全解消 */

.tab-item:last-child {
  margin-right: 0;
  /* タブの間に白線を追加 */
  .tab-item:not(:last-child) {
    border-right: 2px solid #fff;
  }
}
/* ラベル配置を揃え左寄せ */
.important-label, .new-label {
  flex-shrink: 0;
}

.important-label {
  width: 42px;
  height: 42px;
  min-width: 42px;
  min-height: 42px;
  background-color: #7FB922;
  border-radius: 100%;
  background-image: url("@/assets/image/image_look.png");
  background-size: 80% 80%;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 2;
  margin-left: 10px;
  margin-right: 11px;
  box-sizing: border-box;
  padding: 0;
  box-shadow: none;
  /* 画像shadowなし */
}
.tab-item.is-active-important .important-label {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
}

.new-label {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  background-color: #736ED7;
  border-radius: 100%;
  background-image: url("@/assets/image/image_new.png");
  background-size: 80% 80%;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 2;
  margin-left: 10px;
  margin-right: 11px;
  box-sizing: border-box;
  padding: 0;
  box-shadow: none;
}
.tab-item.is-active-latest .new-label {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
}

/* タイトル部分 */
.section-title {
  margin: 0;
  font-size: 17px;
  line-height: 1;
  color: #666;
  font-weight: 500;
  background-color: transparent;
  height: auto;
  display: flex;
  align-items: center;
  border: none;
  position: relative;
  padding: 0;
  letter-spacing: 0.015em;
  transition: color 0.2s;
  user-select: none;
}
.important-title {
  color: #666;
}
.latest-title {
  color: #666;
}
.tab-item.is-active-important .important-title {
  color: #222;
  font-weight: bold;
}
.tab-item.is-active-latest .latest-title {
  color: #222;
  font-weight: bold;
}

/* 下線/アウトラインのための不要な飾りは非表示に */
.tabs-header::after { content: ""; display: none; }
.tab-item:not(.is-active-important):not(.is-active-latest)::after { display: none; }

/* タブ内容(カードエリア含む) */
.tab-content-wrapper {
  padding: 25px 8px 30px 8px;
  border-radius: 0 0 10px 10px;
  background: #fff;
  position: relative;
  box-shadow: 0 2px 8px rgba(127,185,34,0.10);
  transition: border-color .27s, box-shadow .23s;
  min-height: 220px;
  border-width: 2px;
  border-style: solid;
  border-top-color: #fff;
  /* 下のclassで左右下の色を上書きするためデフォ値をセット */
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
}

.tab-content-wrapper.border-important {
  border-right-color: #7FB922 !important;
  border-bottom-color: #7FB922 !important;
  border-left-color: #7FB922 !important;
}

.tab-content-wrapper.border-latest {
  border-right-color: #b3b2e7 !important;
  border-bottom-color: #b3b2e7 !important;
  border-left-color: #b3b2e7 !important;
}
.tab-content-wrapper.border-important {
  border-color: #7FB922 !important;
  box-shadow: 0 2px 10px rgba(176, 221, 108, 0.16);
}
.tab-content-wrapper.border-latest {
  border-color: #b3b2e7 !important;
  box-shadow: 0 2px 12px rgba(115,110,215, 0.16);
}

/* ニュースリスト */
.news-list {
  max-height: 370px;
  overflow-y: auto;
  border: none;
  margin-bottom: 0;
}

.news-list::-webkit-scrollbar {
  width: 7px;
  background: #f4f4fa;
  border-radius: 5px;
}
.news-list::-webkit-scrollbar-thumb {
  background: #d0d0e0;
  border-radius: 5px;
}

/* View More ボタン */
.view-more-container {
  text-align: right;
  padding: 0;
  margin: 0;
  position: relative;
}
.view-more-link {
  position: absolute;
  bottom: -52px;
  right: -12px;
  border-radius: 8px;
  text-decoration: none;
  background-color: white;
  color: #ff5722; /* View More のリンク色 */
  padding: 10px 15px 10px 15px;
  border: 2px solid #FF9999;
  font-size: 1rem;
  font-weight: 500;
  z-index: 50;
  box-shadow: 0 1.5px 6px rgba(255, 170, 170, 0.12);
  transition: background-color 0.18s, color 0.18s, border 0.18s;
  letter-spacing: 0.02em;
}
.view-more-link:hover {
  background-color: #FF9999;
  border: 2px solid #E94040;
  color: white;
}

/* no-news */
.no-news-message {
  text-align: center;
  color: #c1c1c1;
  padding: 30px 0;
  font-style: italic;
  font-size: 15px;
}

@media (max-width: 410px) {
  .mobile-news-tabs-container {
    min-width: unset;
    max-width: 100vw;
    border-radius: 0;
  }
  .tab-content-wrapper {
    border-radius: 0 0 16px 16px;
  }
  .tabs-header {
    border-radius: 0;
  }
}
</style>