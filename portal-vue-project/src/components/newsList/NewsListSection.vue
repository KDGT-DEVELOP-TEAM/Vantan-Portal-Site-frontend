<template>
  <div class="news-list-section">
    <!-- 検索とフィルタリングUI -->
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

      <!-- 管理者向け追加ボタン -->
      <AddNewsButton v-if="isAdmin" @click="goToCreate" />
    </div>

    <!-- リスト表示エリア -->
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
    
    <!-- ページネーション（簡易実装） -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">前へ</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">次へ</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NewsListItem from './NewsListItem.vue';
import AddNewsButton from './AddNewsButton.vue';
// import router from '@/router'; // 実際にはVue Routerを使用

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// --- Mock Data & State ---
const mockNewsData = [
  { id: 1, title: '【重要】年末年始の休業日について', published_at: '2023-12-01', is_important: true, thumbnail_url: 'https://placehold.co/120x80/f15b5b/ffffff?text=Important', category: '学校行事' },
  { id: 2, title: '体育祭の日程変更のお知らせ', published_at: '2023-11-20', is_important: false, thumbnail_url: 'https://placehold.co/120x80/4CAF50/ffffff?text=Sports', category: '学校行事' },
  { id: 3, title: '冬休み期間中の図書館利用について', published_at: '2023-11-15', is_important: false, thumbnail_url: null, category: 'その他' },
  { id: 4, title: '次期保護者面談の予約開始', published_at: '2023-11-10', is_important: true, thumbnail_url: 'https://placehold.co/120x80/2196F3/ffffff?text=Meeting', category: '重要連絡' },
  { id: 5, title: 'システムメンテナンスのお知らせ', published_at: '2023-11-05', is_important: false, thumbnail_url: null, category: 'システム' },
];

const newsList = ref([]);
const categories = ref(['学校行事', '重要連絡', 'システム', 'その他']);
const searchQuery = ref('');
const showImportant = ref(false);
const selectedCategory = ref('');
const currentPage = ref(1);
const itemsPerPage = 5; // 1ページあたりの表示件数

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

  // 5. ページネーション適用
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return list.slice(start, end);
});

const totalPages = computed(() => {
  let list = newsList.value;
  // ページネーション計算のため、フィルタリング後の全件数を取得
  if (showImportant.value) {
    list = list.filter(news => news.is_important);
  }
  if (selectedCategory.value) {
    list = list.filter(news => news.category === selectedCategory.value);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(news => news.title.toLowerCase().includes(query));
  }
  return Math.ceil(list.length / itemsPerPage);
});

// --- Methods ---

/**
 * お知らせ一覧データをAPIから取得する (Mock)
 */
const fetchNewsList = () => {
  // 実際には axios.get('/api/news/') などでAPIコールを行う
  // const response = await axios.get('/api/news/', { params: { page: currentPage.value, ... } });
  // newsList.value = response.data.results;
  
  // Mockデータを設定
  newsList.value = mockNewsData;
};

/**
 * 詳細画面へ遷移
 * @param {number} id - お知らせID
 */
const goToDetail = (id) => {
  console.log('詳細へ遷移:', id);
  // router.push(`/news/${id}`);
};

/**
 * 追加画面へ遷移
 */
const goToCreate = () => {
  console.log('お知らせ追加画面へ遷移');
  // router.push('/news/create');
};

/**
 * 編集画面へ遷移
 * @param {number} id - お知らせID
 */
const goToEdit = (id) => {
  console.log('編集画面へ遷移:', id);
  // router.push(`/news/${id}/edit`);
};

/**
 * 削除処理を実行
 * @param {number} id - お知らせID
 */
const handleDelete = (id) => {
  if (confirm('このお知らせを削除しますか？')) { // 実際にはカスタムモーダルを使用
    console.log('お知らせを削除:', id);
    // 実際には axios.delete(`/api/news/${id}`) でAPIコールを行う
    // 成功後、リストを再取得 (fetchNewsList())
    newsList.value = newsList.value.filter(news => news.id !== id);
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
  display: flex;
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
  min-width: 200px;
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

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* スマホ対応 */
@media (max-width: 768px) {
  .search-filter-area {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .search-box {
    min-width: 100%;
  }
}
</style>