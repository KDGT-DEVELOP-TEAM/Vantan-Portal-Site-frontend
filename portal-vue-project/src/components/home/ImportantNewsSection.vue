<template>
  <div class="news-section important-section">
    <div class="section-header-container">
      <div class="important-label">
        </div>
      <h3 class="section-title">重要なお知らせ</h3>
    </div>

    <div class="news-list">
      <template v-if="newsList && newsList.length > 0">
        <NewsCard
          v-for="item in newsList"
          :key="item.id"
          :item="item"
          :can-edit="canEdit"
        />
      </template>
      <p v-else class="no-news-message">現在、重要なお知らせはありません。</p>
    </div>

    <div v-if="newsList && newsList.length > 0" class="view-more-container">
      <a href="#" class="view-more-link">View More</a>
    </div>
  </div>
</template>

<script>
import NewsCard from './NewsCard.vue';

export default {
  name: 'ImportantNewsSection',
  components: { NewsCard },
  props: {
    newsList: {
      type: Array,
      required: true
    },
    
    canEdit: {
      type: Boolean,
      required: true
    }
  },
  emits: ['edit', 'delete']
}
</script>

<style scoped>

/* ------------------------------------------- */
/* ImportantNewsSection.vue スタイル修正版        */
/* ------------------------------------------- */

/* ベースコンテナ */
.news-section {
  padding: 15px;
  padding-top: 35px; /* ヘッダーがはみ出る分、padding-topを増やす */
  border-radius: 15px; 
  background-color: #fff;
  position: relative;
  border: 2px solid #7FB922; 
  box-shadow: 0 0 5px rgba(140, 255, 140, 0.2);
}

/* ヘッダー全体 (LOOK + 重要なお知らせ) のコンテナ */
.section-header-container {
  display: flex;
  align-items: center;
  position: absolute;
  /* LatestNewsSection と同様に調整 */
  top: -25px; 
  left: 20px;
  padding: 0;
  z-index: 10; 
}

/* LOOK ラベルのギザギザなコンテナ (画像埋め込みのために修正) */
.important-label {
  /* 画像のサイズに合わせる */
  width: 50px; 
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  background-color: #7FB922;
  border-radius: 100% !important;
  background-image: url("@/assets/image/image_look.png"); /* 画像パスを修正 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 2; 
  
  /* タイトルと自然に重なるように調整 */
  margin-right: -10px; /* タイトルとの重なり具合を調整 */
  
  /* 元のスタイルをクリア/リセット */
  box-sizing: border-box; 
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}


/* タイトル「重要なお知らせ」の背景と枠線 */
.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
  /* LOOKと重なる分、左パディングを調整 */
  padding: 5px 15px 3px 35px;
  background-color: white;
  border: 2px solid #7FB922; /* 画像の緑の枠線 */
  height: 38px; /* ラベルの高さと合わせる */
  display: flex;
  align-items: center;
  z-index: 1;

  /* 画像のヘッダー形状を再現 (左は角丸なし、右は角丸あり) */
  border-radius: 0 150px 150px 0;
  border-left: none; 
  position: relative;
  left: -15px; 
}

/* ------------------------------------------- */
/* リスト部分のスタイル (変更なし)              */
/* ------------------------------------------- */

.news-list {
  max-height: 300px; 
  overflow-y: auto;
  padding-top: 0; /* padding-top: 20px; から修正 */
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

/* View More ボタンのスタイルを画像に合わせて調整 (LatestNewsSectionと共通) */
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