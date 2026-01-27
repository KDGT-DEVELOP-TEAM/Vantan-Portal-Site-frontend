<template>
  <div class="news-list-section">
    <div class="search-filter-area">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="タイトルを検索" class="search-input">
        <span class="material-symbols-outlined search-icon">search</span>
      </div>
      
      <div class="filter-controls">
        <label>
          <input type="checkbox" v-model="showImportant"> 
          重要なお知らせのみ
        </label>
      </div>
    </div>
    <div class="NewsListWrapper">
      <div class="news-list-container">
        <NewsListItem 
          v-for="news in filteredNews" 
          :key="news.id" 
          :news="news" 
          :is-admin="isAdmin"
          @view-detail="goToDetail"
          @edit="goToEdit"
          @delete="handleDelete"
        />
        <div v-if="filteredNews.length === 0" class="no-results">
          該当するお知らせはありません。
        </div>
      </div>
    </div>
    

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NewsListItem from './NewsListItem.vue';
import { useRouter } from 'vue-router';
import { getNewsList, deleteNews } from '@/api/news';

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const newsList = ref([]);
const searchQuery = ref('');
const showImportant = ref(false);

// --- Computed Properties ---
const filteredNews = computed(() => {
  let list = [...newsList.value];

  // 1. 重要なお知らせフィルタ
  if (showImportant.value) {
    list = list.filter(news => news.importance);
  }

  // 2. 検索クエリフィルタ
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(news => news.title.toLowerCase().includes(query));
  }

  // 3. ソート (日付降順)
  list.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  return list;
});

// --- Methods ---

const fetchNews = async () => {
  try {
    const response = await getNewsList();
    newsList.value = response.data;
    console.log('お知らせリストをAPIから取得しました。');
  } catch (error) {
    console.error('お知らせリストの取得に失敗しました:', error.response || error);
  }
};

const goToDetail = (id) => {
  console.log('詳細へ遷移:', id);
  router.push(`/news/${id}`);
};

const goToEdit = (id) => {
  console.log('編集画面へ遷移:', id);
  router.push(`/news/${id}/edit`);
};

const handleDelete = async (id) => {
  if (!confirm('このお知らせを削除しますか？')) {
    return;
  }
  try {
    await deleteNews(id);
    console.log(`お知らせID ${id} の削除に成功しました。`);
    // 成功後、リストを再取得して画面を更新
    await fetchNews();
  } catch (error) {
    console.error(`お知らせID ${id} の削除に失敗しました:`, error.response || error);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
.news-list-section {
  margin-top: -60px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 検索＆フィルタエリア */
.search-filter-area {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  flex-grow: 1;
  min-width: 100px;
  max-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 20px;
}

.filter-controls {
  margin-left: 80px;
  margin-top: 8px;
  gap: 15px;
}

/* .category-select - Removed */

.NewsListWrapper {
  display:flex;
  
}

.news-list-container {
  margin-left: 8%;
  width: 750px;;
}

.no-results {
  text-align: center;
  padding: 50px;
  color: #777;
  font-size: 1.1rem;
}

@media (max-width: 1124px) {
  .news-list-section {
    margin-top: 24px;
  }

  /* .category-select - Removed */
}
</style>