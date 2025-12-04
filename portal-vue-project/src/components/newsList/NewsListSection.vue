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
        <select v-model="selectedCategory" class="category-select">
          <option value="">全てのカテゴリー</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <AddNewsButton v-if="isAdmin" @click="goToCreate" />
    </div>

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NewsListItem from './NewsDetail.vue';
import AddNewsButton from './AddNewsButton.vue';
import { useRouter } from 'vue-router';
import authApi from '@/plugins/authApi';

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const newsList = ref([]);
const categories = ref(['学校行事', '重要連絡', 'システム', 'その他']);
const searchQuery = ref('');
const showImportant = ref(false);
const selectedCategory = ref('');


// --- Computed Properties ---
const filteredNews = computed(() => {
  let list = newsList.value;

  // 1. 重要なお知らせフィルタ
  if (showImportant.value) {
    list = list.filter(news => news.is_important);
  }

  // 2. カテゴリーフィルタ
  if (selectedCategory.value) {
    list = list.filter(news => news.category === selectedCategory.value);
  }

  // 3. 検索クエリフィルタ
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(news => news.title.toLowerCase().includes(query));
  }

  // 4. ソート (日付降順)
  list.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));


  return list;
});

// totalPages の computed property を削除しました


// --- Methods ---

const fetchNewsList = async () => { // ★ asyncキーワードを追加
  try {
    const response = await authApi.get('/api/news/'); // ★ authApiを使用
    
    // DRFの標準形式に合わせて、必要であれば response.data.results に変更してください
    newsList.value = response.data; 
    console.log('お知らせリストをAPIから取得しました。');

  } catch (error) {
    console.error('お知らせリストの取得に失敗しました:', error.response || error);
    // 認証エラー（401）時のログアウト処理などをここに追加できます
  }
};

const goToDetail = (id) => {
  console.log('詳細へ遷移:', id);
  router.push(`/news/${id}`); // ★ router.push で遷移を実装
};

const goToCreate = () => {
  console.log('お知らせ追加画面へ遷移');
  router.push('/news/create'); // ★ router.push で遷移を実装
};

const goToEdit = (id) => {
  console.log('編集画面へ遷移:', id);
  router.push(`/news/${id}/edit`); // ★ router.push で遷移を実装
};

/**
 * 削除処理を実行
 * @param {number} id - お知らせID
 */
const handleDelete = async (id) => { // ★ asyncキーワードを追加
  if (!confirm('このお知らせを削除しますか？')) {
    return;
  }
  
  try {
    // 認証済みAPIインスタンスを使用し、DELETE リクエストを送信
    await authApi.delete(`/api/news/${id}/`); // ★ authApiを使用
    console.log(`お知らせID ${id} の削除に成功しました。`);
    
    // 成功後、リストを再取得して画面を更新
    fetchNewsList();
  } catch (error) {
    console.error(`お知らせID ${id} の削除に失敗しました:`, error.response || error);
    alert('削除処理中にエラーが発生しました。');
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchNewsList();
});
</script>

<style scoped>
.news-list-section {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 検索＆フィルタエリア */
.search-filter-area {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
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
  display: flex;
  margin-left: 36px;
  gap: 15px;
  align-items: center;
}

.category-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
}

/* リストコンテナ */
.news-list-container {
  /* NewsListItemコンポーネントのスタイルに依存 */
}

.no-results {
  text-align: center;
  padding: 50px;
  color: #777;
  font-size: 1.1rem;
}
</style>