<template>
  <Layout :user-role="userRole" current-page="時間割リスト" @logout="$emit('logout')">
    <div class="time-schedule-list">
      <h2 class="page-header">時間割リスト</h2>

      <TimeScheduleGradeFilter 
        v-model:selected-grade="selectedGrade"
        @filter="fetchTimeSchedules"
      />

      <div v-if="apiError" class="error-message">
        データ取得に失敗しました: {{ apiError }}
      </div>
      <div v-else-if="loading" class="loading-message">
        データを読み込み中です...
      </div>
      
      <div v-else class="time-schedule-list-container">
        <template v-if="timeSchedules.length > 0">
          <TimeScheduleItem
            v-for="schedule in timeSchedules"
            :key="schedule.id"
            :item="schedule"
            :user-role="userRole"
            @view-detail="handleViewDetail"
            @delete="handleDelete"
            
            />
        </template>
        <p v-else class="no-data-message">該当する時間割はありません。</p>
      </div>
  
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

      <TimeScheduleDetail
        v-if="showDetailModal"
        :schedule-id="selectedScheduleId"
        :user-role="userRole"  @close="showDetailModal = false"
        @delete="handleDelete"  />
    </div>
  </Layout>
</template>
  
<script>
import Layout from '../ui/Layout.vue';
import TimeScheduleGradeFilter from './TimeScheduleGradeFilter.vue';
import TimeScheduleItem from './TimeScheduleItem.vue'; // リスト内の各要素
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import TimeScheduleDetail from './TimeScheduleDetail.vue'; // 詳細モーダル
import { fetchTimeSchedulesApi, deleteTimeScheduleApi } from '@/api/timetable';


export default {
  name: 'TimeScheduleList',
  components: {
    Layout,
    TimeScheduleGradeFilter,
    TimeScheduleItem,
    AddOptionsModal,
    TimeScheduleDetail,
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
      loading: true,
      apiError: null,
      timeSchedules: [],
      selectedGrade: 'all', // フィルターの初期値
      showModal: false, 
      showDetailModal: false,
      selectedScheduleId: null,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      await this.fetchTimeSchedules(this.selectedGrade);
    },
    ensureToken() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('TOKEN_NOT_FOUND');
      }
      return token;
    },
    async fetchTimeSchedules(grade) {
      this.loading = true;
      this.apiError = null;

      try {
        this.ensureToken(); // ← 存在チェックだけに使う
        const params = grade !== 'all' ? { grade } : {};

        const res = await fetchTimeSchedulesApi(params);

        const list = res.data.results ?? res.data;

        this.timeSchedules = list.map(item => ({
          id: item.id,
          title: item.title,
          grade: item.grade,
          createdAt: item.created_at,
          images: item.image || [],
        }));
      } catch (e) {
        console.error(e);
        this.apiError = '時間割の取得に失敗しました';
      } finally {
        this.loading = false;
      }
    },
    handleViewDetail(id) {
      this.selectedScheduleId = id;
      this.showDetailModal = true;
    },
    async handleDelete(id) {
      if (!confirm('この時間割を削除してもよろしいですか？')) return;

      try {
        this.ensureToken();

        await deleteTimeScheduleApi(id);

        alert('時間割が削除されました。');
        await this.fetchTimeSchedules(this.selectedGrade);
      } catch (err) {
        console.error('削除エラー:', err.response || err);
        alert('削除中にエラーが発生しました。');
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
/* 基本的なページ構造 */
.time-schedule-list {
  /* ページの左右の余白を調整 */
  padding: 20px 40px; 
  /* ヘッダーのレイアウトに影響されないよう相対配置 */
  position: relative;
  min-height: 80vh; /* ページコンテンツが少ない場合でもフッターが下に来るように */
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

/* 時間割リストのコンテナ */
.time-schedule-list-container {
    /* 画像のようにカードを並べるためにGridを使用 */
    display: grid;
    /* デスクトップで4枚のカードが均等に並ぶように調整 */
    /* 最小幅を250px程度に設定し、レスポンシブに対応 */
    grid-template-columns: 1fr 1fr;
    gap: 20px; /* カード間のスペース */
    margin-top: 20px;
}

/* データがない場合のメッセージ */
.no-data-message {
    /* コンテナ全体に広げる */
    grid-column: 1 / -1; 
    text-align: center;
    color: #888;
    padding: 30px;
    border: 1px dashed #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

/* --- グローバル追加ボタン (元のスタイルを維持しつつ調整) --- */
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

/* エラーとローディングメッセージ */
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

/* Material Symbolsのフォント設定 */
.material-symbols-outlined {
    font-variation-settings:
      'FILL' 1, 
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
}
/* --- レスポンシブ対応 (スマートフォン用レイアウト) --- */
@media (max-width: 768px) {
  .dashboard-grid {
    /* モバイルタブが代わりに表示されるため、このスタイルは適用されない */
    display: none; 
  }
  
  /* 【修正】HomeViewの左右パディングを小さくする (スマホ画面での飛び出し防止) */
  .time-schedule-list {
    padding: 20px 20px; /* 左右のパディングを40pxから20pxに減らす */
  }
  
  /* グローバルボタンの位置もスマホ用に調整する場合 */
  .global-add-button {
    bottom: 20px;
    right: 20px;
  }
  .time-schedule-list {
    /* スマホでは左右の余白を狭くする（縦長の画像を参照） */
    padding: 10px 20px; 
  }
  
  .time-schedule-list-container {
    /* スマホでは1列表示が基本 */
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0px 40px 0px 0px;
  }
  
  .global-add-button {
    /* スマホではボタンを少し小さく、余白も狭く */
    width: 45px;
    height: 45px;
    bottom: 20px;
    right: 20px;
  }
  .action-buttons-wrapper {
        top: 8px;
        right: 6px;
        gap: 4px;
    }
  
    .download-btn,
    .delete-btn {
        width: 33px;
        height: 29px;
    }
  .icon-plus {
    font-size: 1.8rem; 
  }
}
</style>