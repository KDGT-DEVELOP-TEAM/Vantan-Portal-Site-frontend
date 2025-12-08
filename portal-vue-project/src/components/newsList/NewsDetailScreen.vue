<template>
  <div class="news-detail-screen">
    <div class="content-wrapper">
      <!-- パンくずリスト -->
      <Breadcrumbs :items="breadcrumbs" />

      <!-- ローディング/エラー表示 -->
      <div v-if="loading" class="loading-message">お知らせを読み込み中...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      
      <!-- お知らせ詳細本体 -->
      <div v-else-if="newsItem" class="detail-card">
        <div class="header-section">
          <div class="meta-info">
            <span class="date">{{ newsItem.published_at }}</span>
            <span v-if="newsItem.is_important" class="important-tag">重要</span>
            <span class="category-tag">{{ newsItem.category || '一般' }}</span>
          </div>
          <h1 class="news-title">{{ newsItem.title }}</h1>
        </div>

        <div class="image-gallery">
          <!-- メインサムネイル -->
          <img 
            v-if="newsItem.thumbnail_url" 
            :src="newsItem.thumbnail_url" 
            alt="メイン画像" 
            class="main-thumbnail"
          >
          <div v-else class="image-placeholder main-thumbnail-placeholder">メイン画像なし</div>

          <!-- サブサムネイル -->
          <div v-if="newsItem.sub_thumbnail_url" class="sub-thumbnail-wrapper">
            <img 
              :src="newsItem.sub_thumbnail_url" 
              alt="サブ画像" 
              class="sub-thumbnail"
            >
          </div>
        </div>

        <!-- 本文 -->
        <div class="content-body" v-html="newsItem.content"></div>

        <!-- 関連URL -->
        <div v-if="newsItem.related_url" class="related-url-section">
          <h2>関連情報</h2>
          <a :href="newsItem.related_url" target="_blank" class="related-link">
            関連URLを見る <span class="material-symbols-outlined">open_in_new</span>
          </a>
        </div>
        
        <!-- 管理者アクションボタン -->
        <div v-if="isAdmin" class="admin-actions">
          <button class="action-button edit-button" @click="goToEdit(newsItem.id)">
            <span class="material-symbols-outlined">edit</span> 編集
          </button>
          <button class="action-button delete-button" @click="handleDelete(newsItem.id)">
            <span class="material-symbols-outlined">delete</span> 削除
          </button>
        </div>
      </div>
      
      <div class="back-link-wrapper">
        <a href="/news" class="back-to-list">
          <span class="material-symbols-outlined">chevron_left</span> お知らせ一覧へ戻る
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Breadcrumbs from './Breadcrumbs.vue';
// import { useRoute, useRouter } from 'vue-router'; // 実際にはVue Routerを使用
// import axios from 'axios';

// const route = useRoute();
// const router = useRouter();

// 仮のprops定義（idはURLパスから取得される想定）
const props = defineProps({
  newsId: {
    type: [String, Number],
<<<<<<< HEAD
    default: 1, 
=======
    default: 1, // Mock用
>>>>>>> 1d1cd92ac7d23f5a97cd5228eb7dd636be6db328
  },
  userRole: {
    type: String,
    default: 'viewer',
  },
});

const newsItem = ref(null);
const loading = ref(true);
const error = ref(null);
const isAdmin = computed(() => props.userRole === 'admin');

// Mockデータ
const mockDetail = {
  id: 1,
  title: '【重要】年末年始の休業日について',
  published_at: '2023-12-01',
  is_important: true,
  category: '重要連絡',
  thumbnail_url: 'https://placehold.co/600x400/f15b5b/ffffff?text=Main+Image',
  sub_thumbnail_url: 'https://placehold.co/200x150/4CAF50/ffffff?text=Sub+Image',
  content: '<p>保護者の皆様、関係者の皆様</p><p>日頃より大変お世話になっております。さて、誠に勝手ながら、弊スクールでは下記の期間を年末年始の休業とさせていただきます。</p><p><strong>休業期間：2023年12月29日（金）〜 2024年1月3日（水）</strong></p><p>期間中はご不便をおかけいたしますが、何卒ご理解とご協力をお願い申し上げます。</p>',
  related_url: 'https://example.com/contact',
};

// パンくずリストのデータ
const breadcrumbs = computed(() => [
  { label: 'ホーム', path: '/home' },
  { label: 'お知らせ', path: '/news' },
  { label: newsItem.value ? newsItem.value.title : '詳細', path: `/news/${props.newsId}` },
]);

/**
 * お知らせ詳細データをAPIから取得する (Mock)
 */
const fetchNewsDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 実際には const response = await axios.get(`/api/news/${props.newsId}`);
    // newsItem.value = response.data;
    
    // Mockデータを使用
    await new Promise(resolve => setTimeout(resolve, 500)); // 擬似遅延
    newsItem.value = mockDetail; 
  } catch (err) {
    console.error('お知らせ詳細の取得に失敗:', err);
    error.value = 'お知らせ情報の取得に失敗しました。';
  } finally {
    loading.value = false;
  }
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
    // 実際には axios.delete(`/api/news/${id}`) でAPIコールを行い、成功後に一覧へ遷移
    // router.push('/news');
  }
};

onMounted(() => {
  fetchNewsDetail();
});
</script>

<style scoped>
.news-detail-screen {
  min-height: calc(100vh - 100px);
  background-color: #f7f7f7;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 900px;
  width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-top: 20px;
}

/* ヘッダーセクション */
.header-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 10px;
}

.date {
  font-weight: bold;
}

.important-tag {
  background-color: #f15b5b;
  color: white;
  padding: 4px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.category-tag {
  background-color: #e0e0e0;
  color: #555;
  padding: 4px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.news-title {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

/* 画像ギャラリー */
.image-gallery {
  margin-bottom: 30px;
}

.main-thumbnail {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #f0f0f0;
}

.sub-thumbnail-wrapper {
  text-align: center;
}

.sub-thumbnail {
  max-width: 300px;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #aaa;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
}

.main-thumbnail-placeholder {
  width: 100%;
  height: 250px;
  margin-bottom: 15px;
}

/* 本文 */
.content-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 30px;
}

/* 関連URL */
.related-url-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.related-url-section h2 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 10px;
}

.related-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #1e90ff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s;
}

.related-link:hover {
  color: #007bff;
  text-decoration: underline;
}

.related-link .material-symbols-outlined {
  font-size: 18px;
}

/* 戻るリンク */
.back-link-wrapper {
  text-align: center;
  margin-top: 30px;
}

.back-to-list {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #f15b5b;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  padding: 10px 20px;
  border: 1px solid #f15b5b;
  border-radius: 5px;
  transition: background-color 0.2s, color 0.2s;
}

.back-to-list:hover {
  background-color: #f15b5b;
  color: white;
}

.back-to-list .material-symbols-outlined {
  font-size: 20px;
}

/* ローディング/エラーメッセージ */
.loading-message, .error-message {
  text-align: center;
  padding: 50px;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 10px;
  color: #333;
}
.error-message {
  color: #cc0000;
  border: 1px solid #cc0000;
}

/* 管理者アクションボタン (NewsListItemと共通) */
.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.edit-button {
  background-color: #7FB922;
  color: #f0f8ff;
  border-color: #7FB922;
}

.edit-button:hover {
  background-color: #e0f0ff;
}

.delete-button {
  background-color: #F1494C;
  color: #ffe0e0;
  border-color: #F1494C;
}

.delete-button:hover {
  background-color: #ffc0c0;
}

.action-button .material-symbols-outlined {
  font-size: 18px;
}
</style>