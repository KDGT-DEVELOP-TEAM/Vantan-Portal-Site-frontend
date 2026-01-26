<template>
  <div class="news-item-card" @click="viewDetail">
    <div class="thumbnail-area">
      <img
        :src="thumbnailUrl"
        :alt="thumbnailAlt"
        class="thumbnail-image"
        @error="onThumbnailError"
      />

      <!-- 画像が無い / 壊れている場合のフォールバック表示 -->
      <div v-if="thumbnailFailed" class="thumbnail-placeholder">
        {{ $t('newsList.thumbnail.noImage') }}
      </div>

      <div v-if="isImportant" class="important-badge">
        {{ $t('newsList.badge.important') }}
      </div>
    </div>

    <div class="content-area">
      <div class="meta-data"></div>

      <h3 class="news-title">
        {{ newsTitle }}
      </h3>

      <h4 class="news-created-time">
        {{ formattedCreatedTime }}
      </h4>
    </div>

    <div v-if="isAdmin" class="admin-actions-wrapper" @click.stop>
      <button
        type="button"
        class="action-button edit-button"
        @click="$emit('edit', news.id)"
        :aria-label="$t('common.edit')"
        :title="$t('common.edit')"
      >
        <span class="material-symbols-outlined">edit</span>
      </button>

      <button
        type="button"
        class="action-button delete-button"
        @click="$emit('delete', news.id)"
        :aria-label="$t('common.delete')"
        :title="$t('common.delete')"
      >
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  news: {
    type: Object,
    required: true,
    // 想定: { id, title, created_at, is_important, thumbnail_url, ... }
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view-detail', 'edit', 'delete']);

const thumbnailFailed = ref(false);

/**
 * 詳細画面への遷移をエミット
 */
const viewDetail = () => {
  emit('view-detail', props.news?.id);
};

const isImportant = computed(() => {
  return Boolean(props.news?.is_important);
});

const newsTitle = computed(() => {
  return props.news?.title ?? '';
});

const thumbnailUrl = computed(() => {
  // thumbnail_url が空なら placeholder を使う
  const url = props.news?.thumbnail_url;
  return url && typeof url === 'string' && url.length > 0
    ? url
    : 'https://placehold.co/120x90/eeeeee/999999?text=NO+IMAGE';
});

const thumbnailAlt = computed(() => {
  // i18nはテンプレ内で $t する想定なので、ここでは日本語固定にしない
  // alt は title があればそれを優先
  return props.news?.title ? String(props.news.title) : 'thumbnail';
});

const onThumbnailError = () => {
  // 画像が壊れている / 403 / 404 の場合に placeholder 表示へ
  thumbnailFailed.value = true;
};

watch(
  () => props.news?.thumbnail_url,
  () => {
    // news が切り替わったらエラー状態をリセット
    thumbnailFailed.value = false;
  }
);

const formattedCreatedTime = computed(() => {
  const dateStr = props.news?.created_at;
  if (!dateStr) return '—';

  // Date 変換が失敗しても例外にならないように
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);

  // 表示は ja-JP をデフォルト（必要なら i18n で切替）
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
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

.admin-actions-wrapper {
  margin-left: auto;
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

/* サムネイルエリア */
.thumbnail-area {
  width: 120px;
  min-width: 120px;
  height: 90px;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 画像が壊れている時の上書き表示 */
.thumbnail-placeholder {
  position: absolute;
  inset: 0;
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
  background-color: #f15b5b;
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

.news-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ff9999;
  margin: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.news-created-time {
  font-size: 0.8rem;
  color: #999;
  margin: 5px 0 0 0;
  text-align: left;
  font-weight: normal;
}

.meta-data {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 5px;
}

/* 管理者アクションボタン */
.action-button {
  width: 40px;
  display: flex;
  justify-content: center; /* アイコンのみなので中央寄せの方が自然 */
  align-items: center;
  gap: 3px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s, opacity 0.2s;
}

.edit-button {
  background-color: #7fb922;
  color: white;
  border-color: #7fb922;
}

/* hover時に文字色が白のままで背景だけ薄青になるのは不自然なので、同系で少し濃く */
.edit-button:hover {
  background-color: #6aa11c;
}

.delete-button {
  background-color: #f1494c;
  color: #fff;
  border-color: #f1494c;
}

.delete-button:hover {
  background-color: #d93d40;
}

.action-button .material-symbols-outlined {
  font-size: 16px;
}
</style>
