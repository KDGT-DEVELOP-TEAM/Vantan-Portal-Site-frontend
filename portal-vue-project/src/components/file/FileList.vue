<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="page-container">
      <h2 class="page-header">{{ $t('fileList.title') }}</h2>

      <div class="header-controls">
        <div class="search-bar search-bar-with-icon">
          <span class="search-icon" :aria-label="$t('fileList.searchAriaLabel')">
            <span class="material-symbols-outlined">search</span>
          </span>

          <input
            type="text"
            :placeholder="$t('fileList.searchPlaceholder')"
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearchEnter"
          />

          <button
            type="button"
            class="search-button"
            @click="handleSearchClick"
            :disabled="loading"
          >
            {{ $t('common.search') }}
          </button>
        </div>
      </div>

      <div v-if="apiError" class="error-message">
        {{ $t('fileList.fetchFailed', { detail: apiError }) }}
      </div>

      <div v-else-if="loading" class="loading-message">
        <p>{{ $t('fileList.loading') }}</p>
      </div>

      <div v-else-if="paginatedFiles.length === 0" class="empty-message">
        <p v-if="searchQuery">
          {{ $t('fileList.emptyMatched', { query: searchQuery }) }}
        </p>
        <p v-else>
          {{ $t('fileList.emptyNoFiles') }}
        </p>
      </div>

      <div v-else class="file-scroll-wrapper">
        <div v-for="(row, rowIndex) in fileRows" :key="rowIndex" class="scroll-row">
          <div class="scroll-inner">
            <FileItem
              v-for="file in row"
              :key="file.id"
              :file="file"
              :has-permission="hasPermission"
              class="file-item"
              @view-detail="openModal"
              @delete="handleDeleteFile"
            />
          </div>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="page-arrow first-last-btn"
          :aria-label="$t('common.firstPage')"
        >
          <svg class="first-page-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 5L6 19M18 5L11 12L18 19L18 5Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-arrow prev-next-btn"
          :aria-label="$t('common.prevPage')"
        >
          <svg class="prev-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-btn', { active: currentPage === page }]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-arrow prev-next-btn"
          :aria-label="$t('common.nextPage')"
        >
          <svg class="next-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="page-arrow first-last-btn"
          :aria-label="$t('common.lastPage')"
        >
          <svg class="last-page-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 5L18 19M6 5L13 12L6 19L6 5Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <FileDetail
        v-if="showDetailModal"
        :visible="showDetailModal"
        :file-id="selectedFileId"
        :has-permission="hasPermission"
        @close="closeModal"
        @delete="handleDeleteFile"
      />
    </div>

    <!-- 管理者ボタン：権限キーは要件に合わせて差し替え可 -->
    <button
      v-if="hasPermission(ADMIN_PERMISSION_KEY)"
      class="global-add-button"
      @click="showModal = true"
      :aria-label="$t('fileList.openAdminMenu')"
    >
      <span class="material-symbols-outlined icon-plus">add</span>
    </button>

    <AddOptionsModal
      v-if="hasPermission(ADMIN_PERMISSION_KEY) && showModal"
      @close="showModal = false"
      @select-option="handleModalSelection"
    />
  </Layout>
</template>

<script>
  import axios from 'axios';
  import Layout from '../ui/Layout.vue';
  import AddOptionsModal from '../ui/AddOptionsModal.vue';
  import FileItem from './FileItem.vue';
  import FileDetail from './FileDetail.vue';

  import { hasPermission } from '@/utils/permission';
  import { API_BASE_URL, FILE_ENDPOINT } from '@/api/file';

  export default {
    name: 'FileList',
    components: {
      Layout,
      FileItem,
      AddOptionsModal,
      FileDetail,
    },

    data() {
      return {
        // 権限キー（仕様が固まったら file_manage 等に変更推奨）
        ADMIN_PERMISSION_KEY: 'user_manage',

        loading: false,
        apiError: null,

        searchQuery: '',
        currentPage: 1,

        files: [],

        showDetailModal: false,
        selectedFileId: null,
        showModal: false,

        itemsPerRow: 10,
        maxRowCount: 5,
      };
    },

    computed: {
      /**
       * 入力中のローカルフィルタ（UIの手触り用）
       * サーバ検索は Enter/検索ボタンでのみ実行
       */
      filteredFiles() {
        const q = (this.searchQuery ?? '').toString().trim().toLowerCase();
        if (!q) return this.files;

        return (this.files ?? []).filter((f) => {
          const title = (f?.title ?? '').toString().toLowerCase();
          return title.includes(q);
        });
      },

      totalPages() {
        const pageSize = this.itemsPerRow * this.maxRowCount;
        return Math.max(1, Math.ceil(this.filteredFiles.length / pageSize));
      },

      paginatedFiles() {
        const pageSize = this.itemsPerRow * this.maxRowCount;
        const start = (this.currentPage - 1) * pageSize;
        return this.filteredFiles.slice(start, start + pageSize);
      },

      fileRows() {
        const rows = [];
        for (let r = 0; r < this.maxRowCount; r++) {
          const s = r * this.itemsPerRow;
          const row = this.paginatedFiles.slice(s, s + this.itemsPerRow);
          if (row.length > 0) rows.push(row);
        }
        return rows;
      },

      visiblePages() {
        const total = this.totalPages;
        const current = this.currentPage;
        const maxVisible = 5;

        if (total <= maxVisible) {
          return Array.from({ length: total }, (_, i) => i + 1);
        }

        let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
        let endPage = Math.min(total, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
          startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
      },
    },

    watch: {
      // 入力中にページがズレるのを防ぐ（※サーバ検索はしない）
      searchQuery() {
        this.currentPage = 1;
      },
    },

    mounted() {
      this.fetchFiles();
    },

    methods: {
      hasPermission,

      async fetchFiles() {
        this.loading = true;
        this.apiError = null;

        const token = localStorage.getItem('accessToken');
        if (!token) {
          this.loading = false;
          this.apiError = this.$t('auth.tokenNotFound');
          this.$router?.replace?.('/login');
          return;
        }

        try {
          const q = (this.searchQuery ?? '').toString().trim();
          const searchParam = q ? `?search=${encodeURIComponent(q)}` : '';
          const url = `${API_BASE_URL}${FILE_ENDPOINT}${searchParam}`;

          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // DRFのページング（results）にも配列にも対応
          const data = response.data;
          this.files = Array.isArray(data) ? data : (data?.results ?? []);
        } catch (err) {
          const status = err?.response?.status;
          if (status === 401) {
            this.apiError = this.$t('auth.sessionExpired');
            this.$router?.replace?.('/login');
          } else {
            console.warn('File list fetch failed:', err?.response || err);
            this.apiError =
              err?.response?.data?.detail || this.$t('common.unexpectedError');
          }
          this.files = [];
        } finally {
          this.loading = false;
        }
      },

      handleSearchEnter(e) {
        e?.target?.blur?.();
        this.fetchFiles();
      },

      handleSearchClick() {
        this.fetchFiles();
      },

      goToPage(p) {
        this.currentPage = Math.min(Math.max(1, p), this.totalPages);
      },

      /**
       * FileItem 側は `this.$emit('view-detail', this.file.id)` の形式に統一する前提
       */
      openModal(fileId) {
        if (!fileId) return;
        this.selectedFileId = fileId;
        this.showDetailModal = true;
      },

      closeModal() {
        this.showDetailModal = false;
        this.selectedFileId = null;
      },

      async handleDeleteFile(fileId) {
        const isDirectDelete = !this.showDetailModal;

        if (isDirectDelete) {
          const ok = window.confirm(this.$t('fileList.deleteConfirm'));
          if (!ok) return;
        }

        // テンプレと同じ呼び方に統一（事故防止）
        if (!this.hasPermission(this.ADMIN_PERMISSION_KEY)) {
          window.alert(this.$t('fileList.noDeletePermission'));
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          window.alert(this.$t('auth.tokenNotFound'));
          this.$router?.replace?.('/login');
          return;
        }

        this.apiError = null;

        try {
          const url = `${API_BASE_URL}${FILE_ENDPOINT}${fileId}/`;
          await axios.delete(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          this.closeModal();
          await this.fetchFiles();
          window.alert(this.$t('fileList.deleteSuccess'));
        } catch (err) {
          console.warn('File delete failed:', err?.response || err);
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            this.$t('common.unknownError');

          window.alert(this.$t('fileList.deleteFailed', { detail }));
        }
      },

      /**
       * AddOptionsModal は固定キー（news/article/timeschedule）を返す想定
       */
      handleModalSelection(optionKey) {
        this.showModal = false;

        const routeMap = {
          news: '/news/new',
          article: '/articles/new',
          timeschedule: '/timeschedule',
        };

        const path = routeMap[optionKey];
        if (path) {
          this.$router?.push?.(path);
        } else {
          console.warn('Unknown admin option:', optionKey);
        }
      },
    },
  };
</script>

<style scoped>
  /* ===== Layout ===== */
  .page-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px;
  }

  .page-header {
    text-align: left;
    font-size: 24px;
    margin-top: 15%;
    padding: 0 0 10px 0;
    font-weight: normal;
    color: #f1494c;
    margin-bottom: 30px;
  }

  .header-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  /* ===== Search ===== */
  .search-bar-with-icon {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #f1494c;
    font-size: 22px;
    display: flex;
    align-items: center;
    pointer-events: none;
    user-select: none;
    z-index: 1;
    line-height: 1;
  }

  .search-input {
    padding-left: 38px !important;
    border-color: #ff9999 !important;
    width: 320px;
    border: 2px solid #f0bcbc;
    border-radius: 20px;
    padding: 8px 14px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.18s;
  }

  .search-input:focus {
    border-color: #f1494c !important;
    background-color: #faecec !important;
    transition: border-color 0.24s, background-color 0.24s;
  }

  /* 検索ボタン（納品事故防止） */
  .search-button {
    height: 38px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid #ff9999;
    background: white;
    color: #f1494c;
    cursor: pointer;
  }
  .search-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ===== States ===== */
  .error-message,
  .loading-message,
  .empty-message {
    margin-top: 18px;
    padding: 14px 16px;
    border-radius: 10px;
    background: #fff7f7;
    border: 1px solid #ffd0d0;
    color: #b53a3a;
  }

  .loading-message,
  .empty-message {
    color: #444;
    border-color: #eee;
    background: #fafafa;
  }

  /* ===== List ===== */
  .file-scroll-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .scroll-row {
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .scroll-inner {
    display: flex;
    gap: 20px;
  }

  .file-item {
    min-width: 260px;
  }

  /* ===== Pagination ===== */
  .pagination {
    margin-top: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .page-arrow {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid #eee;
    background: white;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .page-arrow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-btn {
    min-width: 38px;
    height: 38px;
    padding: 0 10px;
    border-radius: 10px;
    border: 1px solid #eee;
    background: white;
    cursor: pointer;
  }

  .page-btn.active {
    border-color: #ff9999;
    color: #f1494c;
    background: #fff3f3;
  }

  .first-page-icon,
  .last-page-icon,
  .prev-icon,
  .next-icon {
    width: 20px;
    height: 20px;
  }

  /* --- グローバル追加ボタン --- */
.global-add-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #ff0000;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 0, 0, 0.4);
  transition: background-color 0.3s, transform 0.3s;
  z-index: 100;
}

.global-add-button:hover {
  background-color: white;
  transform: scale(1.05);
  border: 2px solid #f1494c;
  color: #f1494c;
}

.global-add-button:hover .icon-plus {
  color: #f1494c;
}

.icon-plus {
  color: white;
  font-size: 2rem;
  line-height: 1;
}

</style>