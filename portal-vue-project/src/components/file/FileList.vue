<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="page-container">
      <h2 class="page-header">ファイルリスト</h2>

      <div class="header-controls">
        <div class="search-bar search-bar-with-icon">
          <span class="search-icon" aria-label="検索">
            <span class="material-symbols-outlined">search</span>
          </span>
          <input
            type="text"
            placeholder="キーワードで検索"
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearchEnter"
          >
        </div>
      </div>

      <div v-if="apiError" class="error-message">ファイル一覧の取得に失敗しました: {{ apiError }}</div>

      <div v-else-if="loading" class="loading-message">
          <p>ファイルを読み込み中です...</p>
      </div>

      <div v-else-if="paginatedFiles.length === 0" class="empty-message">
        <p v-if="searchQuery">キーワード「{{ searchQuery }}」に一致するファイルは見つかりませんでした。</p>
        <p v-else>現在、ファイルはありません。</p>
      </div>

      <div v-else class="file-scroll-wrapper">
        <div v-for="(row, rowIndex) in fileRows" :key="rowIndex" class="scroll-row">
          <div class="scroll-inner">
            <FileItem
              v-for="file in row"
              :key="file.id"
              :file="file"
              :api-url="API_URL"
              :api-base-url="API_BASE_URL"
              :has-permission="hasPermission"
              @view-detail="openModal(file.id)"
              @delete="handleDeleteFile"  class="file-item"
            />
          </div>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-arrow first-last-btn">
          <svg class="first-page-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 5L6 19M18 5L11 12L18 19L18 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-arrow prev-next-btn">
          <svg class="prev-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-btn', { active: currentPage === page } ]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-arrow prev-next-btn">
          <svg class="next-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-arrow first-last-btn">
          <svg class="last-page-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 5L18 19M6 5L13 12L6 19L6 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

      </div>
        <FileDetail
          v-if="selectedFileId"
          :visible="showDetailModal"
          :file-id="selectedFileId"
          :has-permission="hasPermission"
          @close="closeModal"
          @delete="handleDeleteFile"
        />

    </div>

    <button 
      v-if="hasPermission('user_manage')"
      class="global-add-button" 
      @click="showModal = true"
    >
      <span class="material-symbols-outlined icon-plus">add</span>
    </button>

    <AddOptionsModal 
      v-if="hasPermission('user_manage') && showModal" 
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
        FileDetail
    },
    data() {
      return {
        API_BASE_URL: API_BASE_URL, // テンプレート/メソッドで使用するために公開
        loading: false,
        apiError: null,

        searchQuery: '',
        currentPage: 1,

        // 実際のファイルデータ
        files: [],

        // モーダル
        showDetailModal: false,
        selectedFileId: null,
        showModal: false, 

        // グリッド設定
        itemsPerRow: 10,
        maxRowCount: 5,
      };
    },

    computed: {
      /* 検索フィルタ */
      filteredFiles() {
        const q = this.searchQuery.trim().toLowerCase();
        if (!q) return this.files;
        // フィルタリングを file.title で行うように修正 (APIデータ構造を想定)
        return this.files.filter(f => f.title.toLowerCase().includes(q));
      },

      /* 総ページ数 */
      totalPages() {
        const pageSize = this.itemsPerRow * this.maxRowCount;
        return Math.max(1, Math.ceil(this.filteredFiles.length / pageSize));
      },

      /* 現在ページのファイル */
      paginatedFiles() {
        const pageSize = this.itemsPerRow * this.maxRowCount;
        const start = (this.currentPage - 1) * pageSize;
        return this.filteredFiles.slice(start, start + pageSize);
      },

      /* 10 × 5 行に並べる */
      fileRows() {
        const rows = [];
        for (let r = 0; r < this.maxRowCount; r++) {
          const s = r * this.itemsPerRow;
          const row = this.paginatedFiles.slice(s, s + this.itemsPerRow);
          if (row.length > 0) rows.push(row);
        }
        return rows;
      },
      
      /**
       * 表示するページ番号のリストを生成（最大5つ）
       */
      visiblePages() {
        const total = this.totalPages;
        const current = this.currentPage;
        const maxVisible = 5; // 最大表示数

        if (total <= maxVisible) {
          // 総ページ数が5以下なら全て表示
          return Array.from({ length: total }, (_, i) => i + 1);
        }

        // 開始ページを計算
        let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
        // 終了ページを計算
        let endPage = Math.min(total, startPage + maxVisible - 1);

        // 終了ページが総ページ数に達していない場合、開始ページを調整
        if (endPage - startPage + 1 < maxVisible) {
          startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        // ページ番号のリストを生成
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        return pages;
      }
    },

    watch: {
      searchQuery() {
        this.currentPage = 1;
      }
    },

    mounted() {
      // ダミーデータを削除し、実際のデータ取得を呼び出す
      this.fetchFiles();
    },

    methods: {
      hasPermission,
      /**
       * ファイル一覧をAPIから取得する
       */
      async fetchFiles() {
          this.loading = true;
          this.apiError = null;
          this.files = []; // 以前のデータをクリア
    
          const token = localStorage.getItem('accessToken');
          if (!token) {
            this.apiError = '認証トークンが見つかりません。';
            this.loading = false;
            return;
          }
    
          try {
            // 検索クエリをURLに追加 (searchフィルターを想定)
            const searchParam = this.searchQuery ? `?search=${this.searchQuery}` : '';
            const url = `${API_BASE_URL}${FILE_ENDPOINT}${searchParam}`;
    
            const response = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // APIの返却値はリスト形式を想定
            this.files = response.data; 
    
          } catch (err) {
            console.error('ファイル一覧APIエラー:', err.response || err);
            this.apiError = 'ファイル一覧の取得中にエラーが発生しました。';
            this.files = []; 
          } finally {
            this.loading = false;
          }
        },

      /* Enter でキーボード閉じる */
      handleSearchEnter(e) {
        e.target.blur();
      },

      /* ページ移動 */
      goToPage(p) {
        this.currentPage = Math.min(Math.max(1, p), this.totalPages);
      },

      handleFileAdd() {
        // ファイル追加画面への遷移を想定（ルーターが必要）
        if (this.$router) {
          this.$router.push('/files/new'); // 仮のルート名
        } else {
          alert('ファイル追加機能へ遷移します。（ルーター未実装）');
        }
      },

      /* モーダル */
      openModal(id) {
        this.selectedFileId = id;
        this.showDetailModal = true;
      },
      closeModal() {
        this.showDetailModal = false;
        this.selectedFileId = null;
      },

      /**
       * ファイル削除処理 (FileDetailモーダル/FileItemからemitされる)
       */
      async handleDeleteFile(fileId) {
        // FileDetail経由の場合はすでに確認済みなので、FileItemからの直接削除時のみ確認を入れる
        const isDirectDelete = !this.showDetailModal; 

        if (isDirectDelete && !confirm('本当にこのファイルを削除してもよろしいですか？')) {
            return;
        }

        if (!hasPermission('user_manage')) {
            alert('ファイルの削除権限がありません。');
            return;
        }

        this.apiError = null;
        const token = localStorage.getItem('accessToken');

        try {
            const url = `${API_BASE_URL}${FILE_ENDPOINT}${fileId}/`;
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 削除成功
            this.closeModal(); // モーダルがもし開いていたら閉じる
            this.fetchFiles(); // リストを再取得して更新
            alert('ファイルを削除しました。');

        } catch (err) {
            console.error('ファイル削除APIエラー:', err.response || err);
            // 削除失敗時はアラートで通知
            alert('ファイルの削除に失敗しました。詳細: ' + (err.response?.data?.detail || err.message || '不明なエラー'));
        }
      },
      handleModalSelection(option) {
        console.log(`【管理者機能】${option}が選択されました。該当ページに遷移します。`);
        // 実際にはここで $router.push() などで遷移ロジックを実装します
        this.showModal = false; 
      }
    }
  };
</script>

<style scoped>
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
    color: #F1494C;
    margin-bottom: 30px;
  }

  .header-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .search-bar-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #F1494C;
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
    border-color: #FF9999 !important;
    transition: border-color 0.24s, background-color 0.24s;
    width: 320px;
    border: 2px solid #f0bcbc;
    border-radius: 20px;
    padding: 8px 14px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.18s;
  }
  .search-input:focus {
    border-color: #F1494C !important;
    background-color: #FAECEC !important;
    transition: border-color 0.24s, background-color 0.24s;
  }
  .add-file-btn {
    width: 48px;
    height: 48px;
    background: #f25c5c;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px #f4bcbc2a;
    transition: background 0.18s;
  }
  .add-file-btn:hover {
    background: #d94b4b;
  }

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

  /* ------------------- ページネーションスタイル ------------------- */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0; /* ボタン間のスペースをゼロにする */
    margin-top: 30px;
    padding: 0 0 12px 0;
    user-select: none;
  }

  /* 矢印・ジャンプボタンのコンテナ */
  .page-arrow {
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, opacity 0.15s;
    height: 38px;
    color: #F1494C;
  }

  .page-arrow:disabled {
    cursor: default;
    opacity: 0.3;
    color: #8D8D8D !important;
  }

  /* 先頭・末尾へのジャンプボタン (画像内の大きな矢印) */
  .first-last-btn {
    width: 30px;
    color: #F1494C;
    /* ジャンプボタンはページ番号ボタンから少し離す */
    margin: 0 5px; 
  }
  .first-last-btn:disabled {
    color: #8D8D8D !important;
  }
  .first-last-btn svg {
    width: 18px;
    height: 18px;
    stroke: currentColor; /* SVGの色をcurrentColorで継承 */
  }

  /* 前・次への移動ボタン (画像内の小さな矢印) */
  .prev-next-btn {
    width: 25px;
    color: #F1494C;
  }
  .prev-next-btn:disabled {
    color: #8D8D8D !important;
  }
  .prev-next-btn svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
  }

  /* ページ番号ボタン */
  .page-btn {
    min-width: 38px; /* ボタンの幅を固定 */
    height: 38px;
    font-size: 1.0rem;
    font-family: inherit;
    border: 1px solid #FF9999; /* 画像の色に合わせて薄めの赤の線 */
    background: white;
    color: #F1494C;
    font-weight: normal;
    margin: 0;
    padding: 0;
    margin-left: 2.5px;
    margin-right: 2.5px;
    transition: all 0.15s;
    cursor: pointer;
    box-sizing: border-box;
    box-shadow: none;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .page-btn.active {
    background: #F1494C;
    color: white;
    font-weight: bold;
    border: 1px solid #F1494C; /* アクティブなボタンの境界線を濃い赤に */
    z-index: 1;
  }

  /* ボタンの角を丸くする設定を修正 */
  .pagination .page-btn:first-of-type {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border-left: 1px solid #FF9999; /* 最初のボタンの左端の線 */
  }
  .pagination .page-btn:last-of-type {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    border-right: 1px solid #FF9999; /* 最後のボタンの右端の線 */
  }
  .pagination .page-btn.active:first-of-type {
    border-left-color: #F1494C;
  }
  .pagination .page-btn.active:last-of-type {
    border-right-color: #F1494C;
  }
  .page-btn:disabled {
    opacity: 0.5;
    cursor: default;
    background: #f7f7f7;
    color: #888;
    border-color: #eee;
    font-weight: normal;
  }
  /* ------------------- ページネーションスタイル 終わり ------------------- */


  /* 状態表示 */
  .error-message,
  .loading-message,
  .empty-message {
    padding: 15px;
    margin: 20px 0;
    border-radius: 7px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 1px 6px #0001;
  }
  .error-message {
    background-color: #ffeaea;
    color: #e04434;
    border: 1px solid #facccc;
  }
  .loading-message {
    background-color: #ebf2ff;
    color: #367eea;
    border: 1px solid #b1c8f7;
  }
  .empty-message {
    background-color: #f7f7f7;
    color: #555;
    font-weight: normal;
    max-width: 95%;
    border: 1px solid #eee;
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
    border: 2px solid #F1494C;
    color: #F1494C;
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 1, 
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }

  @media (max-width: 680px) {
    .page-container {
      padding: 7px;
      max-width: 98vw;
    }
    .header-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 13px;
      width: 100vw;
      max-width: 50%;
      box-sizing: border-box;
      padding-left: 0;
      padding-right: 0;
      overflow-x: hidden;
    }
    .empty-message {
        max-width: 90%;
    }
    .search-bar-with-icon {
      width: 100%;
    }
    .search-input {
      width: 99vw;
      max-width: 97vw;
      min-width: 130px;
      font-size: 14px;
    }
    .file-scroll-wrapper {
      gap: 12px;
      padding: 5%;
    }
    .pagination {
      gap: 0; 
      display: flex;
      margin-top: 15px;
      overflow-x: auto;
      justify-content: center;
      align-items: center;
      padding-bottom: 5px;
      padding: 0 0 12px 0;
      user-select: none;
    }

    .first-last-btn {
      width: 25px;
      margin: 0 3px;
    }
    .prev-next-btn {
      width: 20px;
    }
    .page-btn {
      min-width: 32px;
      height: 32px;
      font-size: 0.9rem;
    }
  }
</style>