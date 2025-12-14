<template>
<div class="gallery-screen">
    <div class="content-wrapper">

        <div class="search-filter-area">
            <div class="search-box">
              <input type="text" v-model="searchQuery" placeholder="キーワードで検索" class="search-input">
              <span class="material-symbols-outlined search-icon">search</span>
            </div>
        </div>
        
        <h1 class="page-title">ギャラリー</h1>
        
        <div class="list-header">
            <router-link 
              v-if="userRole === 'admin'" 
              to="/galleries/create" 
              class="add-button"
            >
              <span>+</span> 新規投稿
            </router-link>
        </div>

        <div v-if="loading" class="status-message loading">
          <div class="loading-spinner"></div>
          読み込み中...
        </div>
        <div v-else-if="error" class="status-message error">{{ error }}</div>
        <div v-else-if="filteredGalleries.length === 0" class="no-results">
          該当するギャラリーはありません。
        </div>

        <template v-else>
            <div v-if="latestGallery" class="latest-gallery-card-wrapper">
                <div 
                    class="gallery-card latest-card"
                    @click="goToDetail(latestGallery.id)"
                >
                <div class="card-thumbnail">
                    <template v-if="getThumbnailUrl(latestGallery).type === 'image'">
                        <img 
                            :src="getThumbnailUrl(latestGallery).url" 
                            :alt="latestGallery.title" 
                            class="card-image"
                        />
                    </template>
                    <template v-else-if="getThumbnailUrl(latestGallery).type === 'pdf'">
                        <PdfThumbnail
                            :pdf-url="getThumbnailUrl(latestGallery).url"
                            :max-height="250" 
                            class="card-image" 
                            style="width: 100%; height: 100%;"
                        />
                    </template>
                    <div v-else class="card-no-image">
                        No Image
                    </div>
                </div>
                      
                <div class="card-content">
                    <h2 class="card-title latest-title">{{ latestGallery.title }}</h2>
                    <p class="card-text latest-text">{{ latestGallery.content }}</p>
                    <div class="card-date">
                        {{ formatDate(latestGallery.created_at) }}
                    </div>
                </div>
                </div>
            </div>

            <div v-if="mainGridGalleries.length > 0" class="gallery-grid">
                <div 
                  v-for="gallery in mainGridGalleries" 
                  :key="gallery.id" 
                  class="gallery-card"
                  @click="goToDetail(gallery.id)"
                >
                    <div class="card-thumbnail">
                        <template v-if="getThumbnailUrl(gallery).type === 'image'">
                            <img 
                                :src="getThumbnailUrl(gallery).url" 
                                :alt="gallery.title" 
                                class="card-image"
                            />
                        </template>
                        <template v-else-if="getThumbnailUrl(gallery).type === 'pdf'">
                            <PdfThumbnail
                                :pdf-url="getThumbnailUrl(gallery).url"
                                :max-height="200" 
                                class="card-image" 
                                style="width: 100%; height: 100%;"
                            />
                        </template>
                        <div v-else class="card-no-image">
                            No Image
                        </div>
                    </div>
                  
                    <div class="card-content">
                        <h2 class="card-title">{{ gallery.title }}</h2>
                        <p class="card-text">{{ gallery.content }}</p>
                        <div class="card-date">
                            {{ formatDate(gallery.created_at) }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/plugins/authApi'; 

import PdfThumbnail from './PdfThumbnail.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const router = useRouter();

const allGalleries = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');

const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'ギャラリー', path: '/gallery' },
]);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getThumbnailUrl = (gallery) => {
    // 現在機能無し
    if (gallery.thumbnail_url && gallery.thumbnail_url.length > 0) {
      return { type: 'image', url: gallery.thumbnail_url };
    }

    // 2. 次点: 添付ファイルの最初の画像を使用
    const files = gallery.images; 
    if (files && files.length > 0) {
      // 最初のファイルのURLを取得 (file_urlまたはattached_fileを使用)
      const firstFileUrl = files[0].file_url || files[0].attached_file; 

      if (firstFileUrl) {
          const urlLower = firstFileUrl.toLowerCase();
          if (urlLower.endsWith('.pdf')) {            
            return { type: 'pdf', url: firstFileUrl }; 
          }
          if (IMAGE_EXTENSIONS.some(ext => urlLower.endsWith(ext))) {            
            return { type: 'image', url: firstFileUrl };
          }
        }
      } 
    return { type: 'none', url: null };
};

// ■ Computed Property: 検索フィルタリング
const filteredGalleries = computed(() => {
  let list = allGalleries.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(gallery => 
      gallery.title.toLowerCase().includes(query) ||
      gallery.content.toLowerCase().includes(query)
    );
  }

  // 日付降順ソート
  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return list;
});

const latestGallery = computed(() => {
  if (filteredGalleries.value.length > 0) {
    return filteredGalleries.value[0];
  }
  return null;
});

const mainGridGalleries = computed(() => {
  // filteredGalleries の2番目以降の要素を返す
  if (filteredGalleries.value.length > 1) {
    return filteredGalleries.value.slice(1);
  }
  return [];
});


const fetchGallery = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await authApi.get('/api/gallery/'); 
    allGalleries.value = response.data;
  } catch (err) {
    console.error('ギャラリーリストの取得に失敗しました:', err);
    error.value = 'ギャラリー情報の取得に失敗しました。';
  } finally {
    loading.value = false;
  }
};

// 詳細画面へ遷移
const goToDetail = (id) => {
  router.push({ name: 'GalleryDetail', params: { id } });
};

// 日付フォーマット
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ja-JP');
};

// マウント時に実行
onMounted(() => {
  fetchGallery();
});
</script>

<style scoped>
/* =======================================================
   ベースレイアウト
   ======================================================= */
.gallery-screen {
  min-height: calc(100vh - 100px); 
  background-color: #f7f7f7;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
  position: relative; /* search-filter-area の absolute 配置のため */
}

/* =======================================================
   ページタイトル
   ======================================================= */
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #F1494C;
  margin-bottom: 5px;
  margin-top: 10px; 
  display: inline-block;
  padding-bottom: 5px;
}

.page-breadcrumbs {
  margin-bottom: 1.5rem;
}

/* =======================================================
   検索エリア
   ======================================================= */
.search-filter-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  max-width: 250px; 
  position: absolute; /* absolute 配置で右上に移動 */
  top: 10px;
  right: 20px;
  background-color: #fff;
  border-radius: 50px; /* 角を丸く */
  overflow: hidden;
  border: 1px solid #FF9999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.search-box {
    position: relative;
    flex-grow: 1;
    border-radius: inherit;
}

.search-input {
  width: 100%;
  border: none;
  font-size: 0.95rem; 
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 35px; /* アイコン分のスペースを確保 */
  padding-right: 15px;
  border-radius: inherit;
}
.search-input:focus {
    outline: none;
    box-shadow: none;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #F1494C;
  font-size: 18px; 
}

/* =======================================================
   リストヘッダー (新規投稿ボタン)
   ======================================================= */
.list-header {
  display: flex;
  justify-content: flex-end; /* 右寄せ */
  align-items: center;
  margin-top: 1rem; 
  margin-bottom: 1.5rem; 
}

.add-button {
  background-color: #F1494C; 
  color: #fff; 
  padding: 0.5rem 1rem; 
  border-radius: 4px; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); 
  transition: background-color 0.15s; 
  display: flex;
  align-items: center;
  gap: 0.5rem; 
  font-size: 0.9rem; 
  font-weight: 600; 
  text-decoration: none; 
}

.add-button:hover {
  background-color: #dc2626; 
}


/* =======================================================
   最新ギャラリーカード (専用スタイル: 1カラム表示)
   ======================================================= */
.latest-gallery-card-wrapper {
    /* 1カラムにするため、左右に余白を設定し、中央に寄せる */
    margin-top: 0.5rem; 
    margin-bottom: 2rem; 
    max-width: 900px; 
    margin-left: auto;
    margin-right: auto;
}

.latest-card {
    /* 通常のカードスタイルを継承しつつオーバーライド */
    display: flex; 
    flex-direction: row;
    height: 250px; 
    border: 3px solid #F1494C; /* 強調 */
    box-shadow: 0 8px 10px rgba(0, 0, 0, 0.15); 
}

.latest-card .card-thumbnail {
    flex: 0 0 35%; /* サムネイルを固定幅にする */
    height: 100%;
}

.latest-card .card-content {
    padding: 1.5rem;
    flex: 1; /* 残りのスペースを占有 */
    display: flex;
    flex-direction: column;
}

.latest-title {
    font-size: 1.5rem;
    color: #F1494C;
    margin-bottom: 0.75rem;
    white-space: normal; /* タイトルを折り返す */
}

.latest-text {
    font-size: 1rem;
    color: #333;
    -webkit-line-clamp: 4; /* 説明文の行数制限を増やす */
}

@media (max-width: 768px) {
    .latest-card {
        flex-direction: column;
        height: auto;
    }
    .latest-card .card-thumbnail {
        flex: 0 0 auto;
        height: 200px;
    }
}


/* =======================================================
   リスト本体 (グリッド)
   ======================================================= */
.gallery-grid {
    margin-left: -24px;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1.5rem; 
}

@media (min-width: 768px) { 
    .gallery-grid {
        margin-left: -24px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) { 
    .gallery-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

/* =======================================================
   ギャラリーカード (通常)
   ======================================================= */
.gallery-card {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gallery-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.card-thumbnail {
  height: 200px; 
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #f3f4f6; 
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af; 
  background-color: #f9fafb; 
  font-weight: bold;
}

.card-content {
  padding: 1rem; 
  flex: 1 1 0%; 
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.125rem; 
  font-weight: bold;
  margin-bottom: 0.5rem; 
  color: #1f2937; 
  /* line-clamp-1 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-text {
  color: #4b5563; 
  font-size: 0.875rem; 
  margin-bottom: 1rem; 
  flex: 1 1 0%; 
  /* line-clamp-2 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-date {
  font-size: 0.75rem; 
  color: #9ca3af; 
  text-align: right;
  margin-top: auto; 
}

/* =======================================================
   ステータス表示
   ======================================================= */
.status-message {
  text-align: center;
  padding: 2.5rem 0; 
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
}

.loading {
  color: #6b7280; 
}

.error {
  color: #ef4444; 
}

.no-results {
  color: #777;
  font-size: 1.1rem;
}

/* ローディングスピナー */
.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #f15b5b; 
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>