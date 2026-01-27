<template>
  <div class="news-section latest-section">
    <div class="section-header-container">
      <div class="new-label"></div>
      <h3 class="section-title">{{ $t('home.latestNews.title') }}</h3>
    </div>

    <div class="news-list">
      <template v-if="newsList && newsList.length > 0">
        <NewsCard 
          v-for="item in newsList" 
          :key="item.id" 
          :item="item" 
          :user-role="userRole" 
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </template>
      <p v-else class="no-news-message">{{ $t('home.latestNews.empty') }}</p>
    </div>

    <div v-if="newsList && newsList.length > 0" class="view-more-container">
      <router-link :to="{ name: 'NewsList' }" class="view-more-link">{{ $t('common.viewMore') }}</router-link>
    </div>
  </div>
</template>

<script>
import NewsCard from './NewsCard.vue'; 

export default {
  name: 'LatestNewsSection',
  components: { NewsCard },
  props: {
      newsList: {
          type: Array,
          required: true,
      },
      userRole: {
          type: String,
          required: true,
      }
  }
}
</script>

<style scoped>
/* ------------------------------------------- */
/* LatestNewsSection.vue スタイル修正版          */
/* ------------------------------------------- */

/* ベースコンテナ */
.news-section {
  padding: 15px;
  position: relative !important;
  padding-top: 35px; 
  border-radius: 15px; 
  background-color: #fff;
  border: 2px solid #736ED7; 
  box-shadow: 0 0 5px rgba(166, 166, 255, 0.2);
  /* overflow: hidden;  */
  padding-top: 35px;
}

/* ヘッダー全体 (NEW + 新着情報) のコンテナ */
.section-header-container {
  display: flex;
  align-items: center;
  position: absolute !important;
  top: -25px; 
  left: 20px;
  padding: 0;
  z-index: 10; 
}

/* NEW ラベルの丸いコンテナ (画像埋め込みのために修正) */
.new-label {
  /* 画像のサイズに合わせる */
  width: 50px; 
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  background-color: #736ED7;
  border-radius: 100% !important;
  background-image: url("@/assets/image/image_new.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 2; 
  
  /* タイトルと自然に重なるように調整 */
  margin-right: -10px; /* タイトルとの重なり具合を調整 */

  box-sizing: border-box; 
  padding: 0;
  box-shadow: none;
}


/* タイトル「新着情報」の背景と枠線 */
.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
  /* NEWと重なる分、左パディングを調整 */
  padding: 5px 15px 3px 35px;
  background-color: white;
  border: 2px solid #736ED7;
  height: 38px; /* NEWラベルの高さと合わせる */
  display: flex;
  align-items: center;
  z-index: 1;

  /* 画像のヘッダー形状を再現 */
  border-radius: 0 150px 150px 0;
  border-left: none; 
  position: relative;
  left: -15px; 
}


/* ------------------------------------------- */
/* リスト部分のスタイル (変更なし)              */
/* ------------------------------------------- */

.news-list {
  padding-top: 0; 
  /* 縦スクロールを有効にするための設定 */
  max-height: 400px; /* お好みで高さ調整 */
  overflow-y: auto;
}

.no-news-message {
  text-align: center;
  color: #999;
  padding: 30px 0;
  font-style: italic;
}

/* View More ボタンのスタイル */
.view-more-container {
  text-align: right;
  padding-top: 15px;
  padding-bottom: 5px; 
}

.view-more-link {
  position: absolute;
  bottom: -20px;
  right: -2px;
  border-radius: 5px;
  text-decoration: none;
  background-color: white;
  color: #ff5722;
  padding: 10px 15px 10px 15px;
  border: 2px solid #FF9999;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background-color 0.3s, color 0.3s, border 0.3s;
}

.view-more-link:hover {
  background-color: #FF9999;
  border: 2px solid #E94040;
  color: white;
}
</style>