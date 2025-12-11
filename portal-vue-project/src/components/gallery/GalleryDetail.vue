<template>
<Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
    <Breadcrumbs :items="breadcrumbs" class="bread-crumbs"/>
    <div class="gallery-detail-container">
        <div v-if="loading" class="status-message loading-state">読み込み中...</div>

        <div v-else-if="gallery" class="gallery-content-card">

          <div class="gallery-header">
            <div class="header-text">
              <h1 class="gallery-title">{{ gallery.title }}</h1>
            </div>
          </div>

          <div class="gallery-body-content">
            {{ gallery.content }}
          </div>

          <div v-if="gallery.files && gallery.files.length > 0" class="gallery-image-section">
            <h3 class="image-section-title">ギャラリー画像</h3>
            <div class="image-grid">
              <div v-for="file in gallery.files" :key="file.id" class="image-item">
                <img :src="file.url" alt="gallery image" class="gallery-image" />
              </div>
            </div>
          </div>
            <p class="gallery-date">
                作成日: {{ new Date(gallery.created_at).toLocaleDateString('ja-JP') }}
            </p>

          <div v-if="userRole === 'admin'" class="admin-actions">
              <button 
                @click="$router.push(`/galleries/${gallery.id}/edit`)" 
                class="action-button edit-button"
              >
                編集
              </button>
              <button 
                @click="deleteGallery" 
                class="action-button delete-button"
              >
                削除
              </button>
              <div class="action-button back-button">
                  <button @click="$router.push('/galleries')" class="back-button">一覧に戻る</button>
              </div>
          </div>
        </div>
        <div v-else-if="error" class="status-message error-state">{{ error }}</div>
    </div>
</Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import authApi from '@/plugins/authApi'; 
import Layout from '../ui/Layout.vue';
import Breadcrumbs from './Breadcrumbs.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'viewer', // 'admin' or 'viewer'
  },
});

const route = useRoute();
const router = useRouter();
const gallery = ref(null);
const loading = ref(true);
const error = ref(null);

const breadcrumbs = ref([
  { label: 'ホーム', path: '/home' },
  { label: 'ギャラリー', path: '/galleries' },
  { label: '詳細', path: route.path },
]);

/**
 * ギャラリー詳細をAPIから取得する
 */
const fetchGalleryDetail = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      // ★ 修正: 実際の API コール: GET /api/galleries/{id}
      const response = await authApi.get(`/api/galleries/${id}`); 
      gallery.value = response.data;

      // ギャラリータイトルが取得できたらパンくずリストを更新
      if (gallery.value?.title) {
          breadcrumbs.value[2].label = gallery.value.title;
      }
      
      if (!gallery.value) {
          error.value = 'ギャラリーが見つかりませんでした。';
      }
    } catch (err) {
        console.error('ギャラリー詳細の取得に失敗しました:', err);
        // エラーレスポンスがあればそれを表示、なければ一般的なエラーメッセージ
        error.value = err.response?.data?.detail || '情報の取得中にエラーが発生しました。';
    } finally {
        loading.value = false;
    }
};

/**
 * ギャラリーを削除する
 */
const deleteGallery = async () => {
  if (!gallery.value || !window.confirm('本当にこのギャラリーを削除しますか？')) {
    return;
  }

  try {
    // ★ 修正: 実際の API コール: DELETE /api/galleries/{id}
    await authApi.delete(`/api/galleries/${gallery.value.id}`);
    
    alert('ギャラリーを削除しました。');
    // 成功したら一覧画面へ遷移
    router.push('/galleries'); 

  } catch (err) {
    console.error('ギャラリー削除に失敗しました:', err);
    alert(`ギャラリー削除に失敗しました: ${err.response?.data?.detail || '不明なエラー'}`);
  }
};

onMounted(() => {
  const id = route.params.id;
  fetchGalleryDetail(id);
});
</script>

<style scoped>
/* =======================================================
   ベースレイアウト
   ======================================================= */
.bread-crumbs {
    margin-top: 120px;
}

.gallery-detail-container {
    max-width: 900px;
    margin: 20px auto;
    padding: 0 20px;
}

.status-message {
    padding: 20px;
    text-align: center;
    color: #555;
    margin-top: 20px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.error-state {
    color: #ef4444;
}


/* =======================================================
   ギャラリーコンテンツカード
   ======================================================= */
.gallery-content-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    /* admin-actions を絶対配置するための基準点に設定 */
    position: relative;
    /* admin-actions のための余白を確保 */
    padding-bottom: 70px; 
}

/* =======================================================
   ヘッダー (タイトル、日付)
   ======================================================= */
.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.header-text {
    flex-grow: 1;
}

.gallery-title {
    font-size: 2rem;
    color: #333;
    margin: 0;
}

.gallery-date {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    color: #888;
    font-size: 0.9rem;
    margin-top: 5px;
}

/* =======================================================
   本文
   ======================================================= */
.gallery-body-content {
    white-space: pre-wrap;
    line-height: 1.8;
    color: #444;
    margin-bottom: 30px;
}


/* =======================================================
   画像セクション
   ======================================================= */
.gallery-image-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px dashed #ccc;
}

.image-section-title {
    font-size: 1.2rem;
    color: #F1494C;
    margin-bottom: 15px;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
}

.image-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.gallery-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
}

/* =======================================================
   管理者アクション (右下配置)
   ======================================================= */
.admin-actions {
    /* 右下に絶対配置 */
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    
    display: flex;
    gap: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.9); 
    border-radius: 4px;
    z-index: 10; 
}

.action-button,
.action-button button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
    font-size: 0.9rem;
    white-space: nowrap;
}

.action-button .back-button {
    padding: 0; 
    background: none;
    color: inherit;
    font-size: inherit;
}
/* div.action-button 自体をボタンのように見せる */
.admin-actions > .action-button {
    background-color: #ccc;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
}
.admin-actions > .action-button:hover {
    background-color: #bbb;
}


/* 個別のボタンのスタイル */
.action-button.edit-button {
    background-color: #7FB922;
    color: white;
}
.action-button.edit-button:hover {
    background-color: #369c70;
}

.action-button.delete-button {
    background-color: #F1494C;
    color: white;
}
.action-button.delete-button:hover {
    background-color: #cc393c;
}

.action-button.back-button {
    background-color: #F1494C;
    color: white;
}
</style>