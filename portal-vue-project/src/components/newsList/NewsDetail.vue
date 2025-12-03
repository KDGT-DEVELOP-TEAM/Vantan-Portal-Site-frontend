<template>
  <div class="news-item-card" @click="viewDetail">
    <div class="thumbnail-area">
      <img v-if="news.thumbnail_url" :src="news.thumbnail_url" alt="お知らせサムネイル" class="thumbnail-image">
      <div v-else class="thumbnail-placeholder">NO IMAGE</div>
      <div v-if="news.is_important" class="important-badge">重要</div>
    </div>
    
    <div class="content-area">
      <div class="meta-data">
        <span class="date">{{ news.published_at }}</span>
        <span class="category-tag">{{ news.category || '一般' }}</span>
      </div>
      <h3 class="news-title">{{ news.title }}</h3>
      
      <!-- 管理者のみ表示 -->
      <div v-if="isAdmin" class="admin-actions" @click.stop>
        <button class="action-button edit-button" @click="$emit('edit', news.id)">
          <span class="material-symbols-outlined">edit</span>編集
        </button>
        <button class="action-button delete-button" @click="$emit('delete', news.id)">
          <span class="material-symbols-outlined">delete</span>削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  news: {
    type: Object,
    required: true,
    // newsオブジェクトの構造を想定
    // { id: number, title: string, published_at: string, is_important: boolean, thumbnail_url: string | null, category: string }
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view-detail', 'edit', 'delete']);

/**
 * 詳細画面への遷移をエミット
 */
const viewDetail = () => {
  emit('view-detail', props.news.id);
};

// サムネイル画像はプレースホルダーを使用
const thumbnailUrl = computed(() => {
  return props.news.thumbnail_url || 'https://placehold.co/120x80/cccccc/333333?text=NO+IMAGE';
});
</script>

<style scoped>
.news-item-card {
  display: flex;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.news-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* サムネイルエリア */
.thumbnail-area {
  width: 120px;
  min-width: 120px;
  height: 90px;
  position: relative;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #aaa;
  font-size: 0.8rem;
  font-weight: bold;
}

.important-badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #f15b5b; /* 重要: 赤色 */
  color: white;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: bold;
  border-bottom-right-radius: 5px;
}

/* コンテンツエリア */
.content-area {
  flex-grow: 1;
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.meta-data {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 5px;
}

.category-tag {
  background-color: #f0f0f0;
  color: #555;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.news-title {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 2行で切り捨て */
  -webkit-box-orient: vertical;
}

/* 管理者アクションボタン */
.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.edit-button {
  background-color: #f0f8ff;
  color: #1e90ff;
  border-color: #1e90ff;
}

.edit-button:hover {
  background-color: #e0f0ff;
}

.delete-button {
  background-color: #ffe0e0;
  color: #cc0000;
  border-color: #cc0000;
}

.delete-button:hover {
  background-color: #ffc0c0;
}

.action-button .material-symbols-outlined {
  font-size: 16px;
}
</style>