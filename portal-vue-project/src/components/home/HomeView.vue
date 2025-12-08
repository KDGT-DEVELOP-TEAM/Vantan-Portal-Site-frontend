<template>
  <Layout :user-role="userRole" current-page="ホーム" @logout="$emit('logout')">
    <div class="home-view">
      <h2 class="page-header">ホーム</h2>
      
      <div v-if="apiError" class="error-message">
        データ取得に失敗しました: {{ apiError }}
      </div>

      <div class="dashboard-grid" v-if="!isMobile && !loading && !apiError">
        <ImportantNewsSection 
          :news-list="importantNews" 
          :user-role="userRole" 
        />
        <LatestNewsSection 
          :news-list="latestNews" 
          :user-role="userRole" 
        />
      </div>
      
      <MobileNewsTabs 
        v-else-if="isMobile && !loading && !apiError"
        :important-news="importantNews"
        :latest-news="latestNews"
        :user-role="userRole"
      />

      <div v-else-if="loading" class="loading-message">
        データを読み込み中です...
      </div>

      <CalendarSection :calendar-url="calendarUrl" />

      <button 
        v-if="userRole === 'admin'" 
        class="global-add-button" 
        @click="showModal = true"
      >
        <span class="material-symbols-outlined icon-plus">add</span>
      </button>

      <AddOptionsModal 
        v-if="userRole === 'admin' && showModal" 
        @close="showModal = false" 
        @select-option="handleModalSelection"
      />

    </div>
  </Layout>
</template>

<script>
import Layout from '../ui/Layout.vue';
import LatestNewsSection from './LatestNewsSection.vue';
import ImportantNewsSection from './ImportantNewsSection.vue';
import CalendarSection from './CalendarSection.vue'; 
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import MobileNewsTabs from './MobileNewsTabs.vue';
import axios from 'axios'; 

const API_BASE_URL = 'http://127.0.0.1:8085'; 
const HOMEPAGE_ENDPOINT = '/api/homepage/'; 

export default {
  name: 'HomeView',
  components: {
    Layout,
    LatestNewsSection,
    ImportantNewsSection,
    CalendarSection,
    AddOptionsModal, 
    MobileNewsTabs,
  },
  props: {
    // App.vueからユーザーロールを受け取る
    userRole: {
      type: String,
      default: 'viewer',
      validator: (value) => ['admin', 'viewer'].includes(value)
    }
  },
  emits: ['logout'],
  data() {
    return {
      latestNews: [],
      importantNews: [],
      calendarUrl: '', 
      loading: true, 
      apiError: null, 
      showModal: false, 
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth < 768;
    }
  },
  async mounted() {
      // APIからデータを取得
      await this.fetchHomePageData();
      window.addEventListener('resize', this.updateWidth);
  },
  unmounted() {
      window.removeEventListener('resize', this.updateWidth);
  },
  methods: {
    updateWidth() {
      this.windowWidth = window.innerWidth;
    },
    formatDate(timestamp) {
        if (!timestamp) return '日付不明';
        try {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        } catch (e) {
            console.error("日付のパースに失敗:", timestamp, e);
            return '日付不明';
        }
    },
    async fetchHomePageData() {
        this.loading = true;
        this.apiError = null;
        
        const token = localStorage.getItem('accessToken');
        console.log("取得されたトークン:", token ? '有効なトークンが見つかりました' : 'トークンが見つかりません'); 
        if (!token) {
            this.apiError = '認証トークンが見つかりません。再ログインが必要です。';
            this.loading = false;
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}${HOMEPAGE_ENDPOINT}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data;
            this.latestNews = (data.new_news || []).map(item => ({
                id: item.id,
                title: item.title,
                date: this.formatDate(item.updated_at), // APIのupdated_atをdateに変換
                isDimmed: item.is_read || false // APIのis_readをisDimmedにマッピング
            }));
            
            this.importantNews = (data.important_news || []).map(item => ({
                id: item.id,
                title: item.title,
                date: this.formatDate(item.updated_at), // APIのupdated_atをdateに変換
                isDimmed: item.is_read || false // APIのis_readをisDimmedにマッピング
            }));

            this.calendarUrl = data.calendar_url || 'https://default-calendar-url.com'; 
            
            console.log("ホームデータ取得成功:", data);
            console.log("新着ニュースの件数 (整形後):", this.latestNews.length); // 件数を確認

        } catch (err) {
            console.error("ホームAPIエラー:", err.response || err);
            this.apiError = 'サーバーからのデータ取得中にエラーが発生しました。';
        } finally {
            this.loading = false;
        }
    },
    handleModalSelection(option) {
      console.log(`【管理者機能】${option}が選択されました。該当ページに遷移します。`);
      // 実際にはここで $router.push() などで遷移ロジックを実装します
      this.showModal = false; 
    }
  }
}
</script>

<style scoped>
/* dashboard-grid のマージン調整 (モバイルタブが表示される位置に合わせる) */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  gap: 30px;
  margin-bottom: 30px;
  /* PC表示時の上部マージンを既存の100pxに維持 */
  margin-top: 100px;
}

.home-view {
  padding: 20px 40px;
  min-height: 100vh; 
}

.error-message, .loading-message {
    padding: 15px;
    margin: 20px 0;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}
.error-message {
    background-color: #fdd;
    color: #cc0000;
}
.loading-message {
    background-color: #eef;
    color: #007bff;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); 
  gap: 30px;
  margin-bottom: 30px;
  margin-top: 100px;
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
.global-add-button:hover .icon-plus {
  color: #F1494C;
}

.icon-plus {
  color: white;
  font-size: 2rem; 
  line-height: 1;
}

.material-symbols-outlined {
    font-variation-settings:
      'FILL' 1, 
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
}

@media (max-width: 768px) {
  .dashboard-grid {
    /* モバイルタブが代わりに表示されるため、このスタイルは適用されない */
    display: none; 
  }
  
  /* 【修正】HomeViewの左右パディングを小さくする (スマホ画面での飛び出し防止) */
  .home-view {
    padding: 20px 20px; /* 左右のパディングを40pxから20pxに減らす */
  }
  
  /* グローバルボタンの位置もスマホ用に調整する場合 */
  .global-add-button {
    bottom: 20px;
    right: 20px;
  }
  .dashboard-grid {
    /* スマホサイズ以下では1列表示に切り替え */
    grid-template-columns: 1fr; 
    gap: 40px; /* 縦に並んだときの間隔を少し広げる */
    margin-top: 50px; /* 縦に長くなるので、マージンを調整 */
  }
  
  /* 【追加】HomeViewの左右パディングを小さくする (スマホ画面での飛び出し防止) */
  .home-view {
    padding: 20px 20px; /* 左右のパディングを40pxから20pxに減らす */
  }
  
  /* グローバルボタンの位置もスマホ用に調整する場合 */
  .global-add-button {
    bottom: 20px;
    right: 20px;
  }
}
</style>