<template>
  <div class="news-section important-section">
    <!-- ===== Header ===== -->
    <div class="section-header-container">
      <div class="important-label" />
      <h3 class="section-title">重要なお知らせ</h3>
    </div>

    <!-- ===== News List ===== -->
    <div class="news-list">
      <template v-if="newsList.length > 0">
        <NewsCard
          v-for="item in newsList"
          :key="item.id"
          :item="item"
          :can-edit="canEdit"
        />
      </template>
      <p v-else class="no-news-message">
        現在、重要なお知らせはありません。
      </p>
    </div>

    <!-- ===== View More ===== -->
    <div v-if="newsList.length > 0" class="view-more-container">
      <router-link
        to="/news?type=important"
        class="view-more-link"
      >
        View More
      </router-link>
    </div>
  </div>
</template>

<script>
  import NewsCard from './NewsCard.vue';

  export default {
    name: 'ImportantNewsSection',
    components: {
      NewsCard,
    },
    props: {
      newsList: {
        type: Array,
        required: true,
        default: () => [],
      },
      canEdit: {
        type: Boolean,
        required: true,
      },
    },
  };
</script>

<style scoped>
  /* Base Container */
  .news-section {
    position: relative;
    padding: 35px 15px 15px;
    border-radius: 15px;
    background-color: #ffffff;
    border: 2px solid #7fb922;
    box-shadow: 0 0 5px rgba(140, 255, 140, 0.2);
  }

  /* Header */
  .section-header-container {
    display: flex;
    align-items: center;
    position: absolute;
    top: -25px;
    left: 20px;
    z-index: 10;
  }

  .important-label {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    background-color: #7fb922;
    background-image: url('@/assets/image/image_look.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    border-radius: 50%;
    margin-right: -10px;
    z-index: 100;
    position: relative;
  }

  .section-title {
    display: flex;
    align-items: center;
    height: 38px;
    margin: 0;
    padding: 5px 15px 3px 35px;
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
    background-color: #ffffff;
    border: 2px solid #7fb922;
    border-left: none;
    border-radius: 0 150px 150px 0;
    position: relative;
    left: -15px;
  }

  /* News List */
  .news-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .no-news-message {
    padding: 30px 0;
    text-align: center;
    color: #999;
    font-style: italic;
  }

  /* View More */
  .view-more-container {
    text-align: right;
    padding-top: 15px;
  }

  .view-more-link {
    position: absolute;
    bottom: -20px;
    right: -2px;
    padding: 10px 15px;
    background-color: #ffffff;
    color: #ff5722;
    text-decoration: none;
    border: 2px solid #ff9999;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .view-more-link:hover {
    background-color: #ff9999;
    border-color: #e94040;
    color: #ffffff;
  }
</style>