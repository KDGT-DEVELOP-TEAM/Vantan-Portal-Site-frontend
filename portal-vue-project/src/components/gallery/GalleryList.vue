<template>
  <div class="gallery-screen">
    <div class="content-wrapper">
      <div class="controls-container" ref="controlsContainerRef">
        <div class="controls-inner-wrapper">
          <div class="search-filter-area">
            <div class="search-box">
              <input
                type="text"
                v-model="searchQuery"
                :placeholder="$t('gallery.list.searchPlaceholder')"
                class="search-input"
              />
              <span class="material-symbols-outlined search-icon">search</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="controls-container-placeholder"
        :style="{ height: placeholderHeight + 'px' }"
      ></div>

      <h1 class="page-title">{{ $t('gallery.list.title') }}</h1>

      <div v-if="loading" class="status-message loading">
        <div class="loading-spinner"></div>
        {{ $t('common.loading') }}
      </div>

      <div v-else-if="error" class="status-message error">{{ error }}</div>

      <div v-else-if="filteredGalleries.length === 0" class="no-results">
        {{ $t('gallery.list.noResults') }}
      </div>

      <template v-else>
        <!-- Latest Galleries -->
        <div
          v-if="paginatedLatestGalleries.length > 0"
          class="latest-gallery-card-wrapper"
        >
          <div
            v-for="gallery in paginatedLatestGalleries"
            :key="gallery.id"
            class="gallery-card latest-card"
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
                  :max-height="250"
                  class="card-image"
                  style="width: 100%; height: 100%;"
                />
              </template>

              <div v-else class="card-no-image">
                {{ $t('common.noImage') }}
              </div>
            </div>

            <div class="card-content">
              <h2 class="card-title latest-title">{{ gallery.title }}</h2>
              <p class="card-text latest-text">{{ gallery.content }}</p>
              <div class="card-date">
                {{ formatDate(gallery.created_at) }}
              </div>
            </div>

            <!-- 削除ボタン -->
            <button
              class="delete-button"
              @click.stop="deleteGallery(gallery.id)"
              :aria-label="`Delete gallery ${gallery.title}`"
              type="button"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <!-- Latest Pagination -->
        <div
          v-if="totalPagesForLatest > 1"
          class="pagination-controls latest-pagination"
        >
          <button
            @click="changeLatestPage(1)"
            :disabled="latestCurrentPage === 1"
            class="pagination-button skip-button"
            type="button"
            aria-label="first"
          >
            <span class="material-symbols-outlined"
              >keyboard_double_arrow_left</span
            >
          </button>

          <button
            @click="changeLatestPage(latestCurrentPage - 1)"
            :disabled="latestCurrentPage === 1"
            class="pagination-button"
            type="button"
            aria-label="prev"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <div class="latest-pagination-dots">
            <button
              v-for="page in totalPagesForLatest"
              :key="page"
              @click="changeLatestPage(page)"
              :class="['pagination-dot', { active: latestCurrentPage === page }]"
              type="button"
              aria-label="page"
            ></button>
          </div>

          <button
            @click="changeLatestPage(latestCurrentPage + 1)"
            :disabled="latestCurrentPage === totalPagesForLatest"
            class="pagination-button"
            type="button"
            aria-label="next"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>

          <button
            @click="changeLatestPage(totalPagesForLatest)"
            :disabled="latestCurrentPage === totalPagesForLatest"
            class="pagination-button skip-button"
            type="button"
            aria-label="last"
          >
            <span class="material-symbols-outlined"
              >keyboard_double_arrow_right</span
            >
          </button>
        </div>

        <!-- Main Gallery Grid -->
        <div v-if="paginatedMainGalleries.length > 0" class="gallery-grid">
          <div
            v-for="gallery in paginatedMainGalleries"
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
                {{ $t('common.noImage') }}
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

        <!-- Main Pagination -->
        <div
          v-if="totalPagesForMain > 1"
          class="pagination-controls main-pagination"
        >
          <button
            @click="changeMainPage(1)"
            :disabled="mainCurrentPage === 1"
            class="pagination-button skip-button"
            type="button"
            aria-label="first"
          >
            <span class="material-symbols-outlined"
              >keyboard_double_arrow_left</span
            >
          </button>

          <button
            @click="changeMainPage(mainCurrentPage - 1)"
            :disabled="mainCurrentPage === 1"
            class="pagination-button"
            type="button"
            aria-label="prev"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <div class="page-numbers">
            <button
              v-for="page in mainPageNumbers"
              :key="page"
              @click="page !== '...' && changeMainPage(page)"
              :disabled="page === '...'"
              :class="[
                'page-number-button',
                { active: mainCurrentPage === page, dots: page === '...' },
              ]"
              type="button"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="changeMainPage(mainCurrentPage + 1)"
            :disabled="mainCurrentPage === totalPagesForMain"
            class="pagination-button"
            type="button"
            aria-label="next"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>

          <button
            @click="changeMainPage(totalPagesForMain)"
            :disabled="mainCurrentPage === totalPagesForMain"
            class="pagination-button skip-button"
            type="button"
            aria-label="last"
          >
            <span class="material-symbols-outlined"
              >keyboard_double_arrow_right</span
            >
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { fetchGalleries } from '@/api/gallery';

import PdfThumbnail from './PdfThumbnail.vue';

defineProps({
  userPermissions: {
    type: Array,
    default: () => [],
  },
});

const router = useRouter();
const { locale } = useI18n();

const allGalleries = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');

// pagination state
const latestCurrentPage = ref(1);
const mainCurrentPage = ref(1);
const LATEST_ITEMS_PER_PAGE = 1; // UI shows 1 card at a time with dots for latest
const MAIN_ITEMS_PER_PAGE = 15;

const controlsContainerRef = ref(null);
const placeholderHeight = ref(0);

const updatePlaceholderHeight = () => {
  if (controlsContainerRef.value) {
    placeholderHeight.value = controlsContainerRef.value.offsetHeight;
  }
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

const getThumbnailUrl = (gallery) => {
  if (!gallery) return { type: 'none', url: null };

  if (gallery.thumbnail_url && gallery.thumbnail_url.length > 0) {
    return { type: 'image', url: gallery.thumbnail_url };
  }

  const files = gallery.images;
  if (files && files.length > 0) {
    const firstFileUrl = files[0].file_url || files[0].attached_file;
    if (firstFileUrl) {
      const urlLower = String(firstFileUrl).toLowerCase();
      if (urlLower.endsWith('.pdf')) {
        return { type: 'pdf', url: firstFileUrl };
      }
      if (IMAGE_EXTENSIONS.some((ext) => urlLower.endsWith(ext))) {
        return { type: 'image', url: firstFileUrl };
      }
    }
  }

  return { type: 'none', url: null };
};

const filteredGalleries = computed(() => {
  let list = allGalleries.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter((gallery) => {
      const title = (gallery?.title ?? '').toLowerCase();
      const content = (gallery?.content ?? '').toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return list;
});

watch(searchQuery, () => {
  latestCurrentPage.value = 1;
  mainCurrentPage.value = 1;
});

const latestGalleries = computed(() => {
  return filteredGalleries.value.slice(0, 5);
});

const totalPagesForLatest = computed(() => {
  // one item per page (dots reflect count)
  return latestGalleries.value.length;
});

const paginatedLatestGalleries = computed(() => {
  if (latestGalleries.value.length === 0) return [];
  const index = latestCurrentPage.value - 1;
  return [latestGalleries.value[index]];
});

const mainGalleries = computed(() => {
  return filteredGalleries.value;
});

const totalPagesForMain = computed(() => {
  return Math.ceil(mainGalleries.value.length / MAIN_ITEMS_PER_PAGE);
});

const paginatedMainGalleries = computed(() => {
  const startIndex = (mainCurrentPage.value - 1) * MAIN_ITEMS_PER_PAGE;
  const endIndex = startIndex + MAIN_ITEMS_PER_PAGE;
  return mainGalleries.value.slice(startIndex, endIndex);
});

const mainPageNumbers = computed(() => {
  const total = totalPagesForMain.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const current = mainCurrentPage.value;
  const pages = [1];
  if (current > 4) pages.push('...');
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 3) pages.push('...');
  pages.push(total);
  return pages.filter((v, i, a) => a.indexOf(v) === i);
});

const goToDetail = (id) => {
  router.push({ name: 'GalleryDetail', params: { id } });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const localeMap = { ja: 'ja-JP', en: 'en-US' };
  const loc = localeMap[locale.value] ?? 'ja-JP';
  return new Date(dateStr).toLocaleDateString(loc);
};

const changeLatestPage = (page) => {
  if (page >= 1 && page <= totalPagesForLatest.value) {
    latestCurrentPage.value = page;
  }
};

const changeMainPage = (page) => {
  if (page >= 1 && page <= totalPagesForMain.value) {
    mainCurrentPage.value = page;
  }
};

onMounted(() => {
  fetchGalleries(loading, error, allGalleries);
  updatePlaceholderHeight();
});

onUpdated(() => {
  updatePlaceholderHeight();
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
}

/* =======================================================
   固定ヘッダー
   ======================================================= */
.controls-container {
  position: fixed;
  top: 160px; /* 大画面用のデフォルト値 */
  left: 0;
  right: 0;
  width: 95%;
  margin: 0 auto;
  z-index: 9999;
  box-sizing: border-box;
}

@media (max-width: 1124px) {
  .controls-container {
    top: 80px; /* 中画面用の値 */
  }
}

@media (max-width: 768px) {
  .controls-container {
    top: 80px; /* 小画面用の値 */
  }
}

.controls-inner-wrapper {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-container-placeholder {
  transition: height 0.2s;
}

/* =======================================================
   ページタイトル
   ======================================================= */
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #f1494c;
  margin-bottom: 5px;
  margin-top: -120px;
  display: block;
  padding-bottom: 5px;
  text-align: left;
}

/* =======================================================
   検索エリア
   ======================================================= */
.search-filter-area {
  display: flex;
  align-items: center;
  max-width: 250px;
  background-color: #fff;
  border-radius: 50px;
  overflow: hidden;
  border: 1px solid #ff9999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  padding-left: 35px;
  padding-right: 15px;
  border-radius: inherit;
  background-color: transparent;
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
  color: #f1494c;
  font-size: 18px;
}

/* =======================================================
   最新ギャラリーカード (専用スタイル: 1カラム表示)
   ======================================================= */
.latest-gallery-card-wrapper {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.latest-card {
  display: flex;
  flex-direction: row;
  height: 250px;
  border: 3px solid #f1494c;
  box-shadow: 0 8px 10px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.latest-card .card-thumbnail {
  flex: 0 0 35%;
  height: 100%;
}

.latest-card .card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.latest-title {
  font-size: 1.5rem;
  color: #f1494c;
  margin-bottom: 0.75rem;
  white-space: normal;
}

.latest-text {
  font-size: 1rem;
  color: #333;
  -webkit-line-clamp: 4;
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
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .gallery-grid {
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-text {
  color: #4b5563;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  flex: 1 1 0%;
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
   ページネーション
   ======================================================= */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.main-pagination {
  margin-top: 2.5rem;
}

.pagination-button,
.page-number-button {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  color: #333;
}

.pagination-button:hover,
.page-number-button:hover {
  background-color: #f1f1f1;
}

.pagination-button:disabled,
.page-number-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px;
}

.page-number-button {
  border-radius: 8px;
  width: auto;
  padding: 0 12px;
  font-size: 0.9rem;
}

.page-number-button.active {
  background-color: #f1494c;
  color: #fff;
  border-color: #f1494c;
  font-weight: bold;
}

.page-number-button.dots {
  cursor: default;
  background-color: transparent;
  border-color: transparent;
}

.skip-button .material-symbols-outlined {
  color: #f1494c;
}

/* 新着ギャラリーのページネーション */
.latest-pagination {
  gap: 16px;
}

.latest-pagination-dots {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #f1494c;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.pagination-dot.active {
  background-color: #f1494c;
}

.pagination-dot:hover:not(.active) {
  background-color: #ffe0e0;
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

/* 削除ボタンスタイル */
.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 20, 20, 0.85);
  border: none;
  border-radius: 50%;
  padding: 6px;
  color: white;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease;
  z-index: 10;
}

.delete-button:hover {
  background-color: rgba(255, 20, 20, 1);
}

/* 削除ボタンのアイコンのマテリアルシンボルはそのまま */

.gallery-card {
  position: relative; /* 削除ボタンの絶対配置のため必要 */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .content-wrapper {
    padding: 0 10px;
  }

  .page-title {
    display: none;
  }

  .search-filter-area {
    position: static;
    max-width: 100%;
    justify-content: center;
    margin: 0 auto 15px auto;
  }

  .main-pagination .page-numbers {
    gap: 4px;
    margin: 0 8px;
  }

  .main-pagination .page-number-button {
    padding: 0 8px;
    height: 36px;
  }
}
</style>
