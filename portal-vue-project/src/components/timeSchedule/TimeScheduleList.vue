<template>
  <Layout :user-role="userRole" current-page="時間割リスト" @logout="$emit('logout')">
    <div class="time-schedule-list">
      <h2 class="page-header">時間割リスト</h2>

      <TimeScheduleGradeFilter 
        v-model:selected-grade="selectedGrade"
        @filter="fetchTimeSchedules"
      />

      <div v-if="apiError" class="error-message">
        {{ apiError }}
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
import TimeScheduleItem from './TimeScheduleItem.vue';
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import TimeScheduleDetail from './TimeScheduleDetail.vue';
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
      selectedGrade: 'all',
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
    async fetchSchedulesFromApi(params) {
      return await fetchTimeSchedulesApi(params);
    },
    // トークン存在チェック（API呼び出し前のガードとして使用）
    ensureToken() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('TOKEN_NOT_FOUND');
      }
      return token;
    },

    // データの整形ロジックを分離
    normalizeSchedules(responseData) {
      // DRFのPagination等のレスポンス構造に対応 (resultsがある場合はそれを使う)
      const list = responseData.results ?? responseData;
      
      return list.map(item => ({
        id: item.id,
        title: item.title,
        grade: item.grade,
        createdAt: item.created_at, // APIのsnake_caseをcamelCaseへ
        images: item.image || [],
      }));
    },

    // エラーハンドリングを分離
    handleApiError(error) {
      console.error(error);
      this.apiError = '時間割の取得に失敗しました';
    },
    // メイン処理：呼び出し・変換・エラー制御を統括
    async fetchTimeSchedules(grade) {
      this.loading = true;
      this.apiError = null;

      try {
        const params = grade !== 'all' ? { grade } : {};
        const response = await this.fetchSchedulesFromApi(params);
        this.timeSchedules = this.normalizeSchedules(response.data);
      } catch (e) {
        this.handleApiError(e);
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
        await deleteTimeScheduleApi(id);
        await this.fetchTimeSchedules(this.selectedGrade);
      } catch (err) {
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
  padding: 20px 40px; 
  position: relative;
  min-height: 80vh; 
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
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px; 
    margin-top: 20px;
}

/* データがない場合のメッセージ */
.no-data-message {
    grid-column: 1 / -1; 
    text-align: center;
    color: #888;
    padding: 30px;
    border: 1px dashed #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
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

/* --- レスポンシブ対応 --- */
@media (max-width: 768px) {
  .dashboard-grid {
    display: none; 
  }
  
  .time-schedule-list {
    padding: 10px 20px; 
  }
  
  .time-schedule-list-container {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0px 40px 0px 0px;
  }
  
  .global-add-button {
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