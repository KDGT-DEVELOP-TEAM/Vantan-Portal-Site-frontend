<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="time-schedule-list">
      <h2 class="page-header">{{ $t('timeschedule.list.title') }}</h2>

      <TimeScheduleGradeFilter
        v-model:selectedGrade="selectedGrade"
        @filter="fetchTimeSchedules"
      />

      <div v-if="apiError" class="error-message">
        {{ apiError }}
      </div>

      <div v-else-if="loading" class="loading-message">
        {{ $t('timeschedule.list.loading') }}
      </div>

      <div v-else class="time-schedule-list-container">
        <template v-if="timeSchedules.length > 0">
          <TimeScheduleItem
            v-for="schedule in timeSchedules"
            :key="schedule.id"
            :item="schedule"
            :can-delete="hasPermission('user_manage')"
            @view-detail="handleViewDetail"
            @delete="handleDelete"
          />
        </template>
        <p v-else class="no-data-message">
          {{ $t('timeschedule.list.empty') }}
        </p>
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

      <TimeScheduleDetail
        v-if="showDetailModal"
        :schedule-id="selectedScheduleId"
        :can-delete="hasPermission('user_manage')"
        @close="showDetailModal = false"
        @delete="handleDelete"
      />
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
  import { hasPermission } from '@/utils/permission';

  export default {
    name: 'TimeScheduleList',
    components: {
      Layout,
      TimeScheduleGradeFilter,
      TimeScheduleItem,
      AddOptionsModal,
      TimeScheduleDetail,
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
      hasPermission,

      async init() {
        await this.fetchTimeSchedules(this.selectedGrade);
      },

      ensureToken() {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('TOKEN_NOT_FOUND');
        return token;
      },

      async fetchSchedulesFromApi(params) {
        
        return await fetchTimeSchedulesApi(params);
      },

      normalizeSchedules(responseData) {
        const list = responseData.results ?? responseData;

        return (list || []).map((item) => ({
          id: item.id,
          title: item.title,
          grade: item.grade,
          createdAt: item.created_at,
          // 一覧では images に正規化（Item側は images を参照）
          images: item.image || [],
        }));
      },

      handleApiError(error) {
        console.error(error);
        this.apiError = this.$t('timeschedule.list.fetchFailed');
      },

      async fetchTimeSchedules(grade) {
        this.loading = true;
        this.apiError = null;

        try {
          this.ensureToken();
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
        if (!confirm(this.$t('timeschedule.list.confirmDelete'))) return;

        try {
          this.ensureToken();
          // axiosInstanceを実装しているため、tokenは渡さずで大丈夫です
          await deleteTimeScheduleApi(id);

          await this.fetchTimeSchedules(this.selectedGrade);
        } catch (err) {
          console.error(err);
          alert(this.$t('timeschedule.list.deleteFailed'));
        }
      },

      handleModalSelection(option) {
        console.log(`【管理者機能】${option} selected`);
        this.showModal = false;
      },
    },
  };
</script>

<style scoped>
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
    color: #f1494c;
    margin-bottom: 30px;
  }

  .time-schedule-list-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
  }

  .no-data-message {
    grid-column: 1 / -1;
    text-align: center;
    color: #888;
    padding: 30px;
    border: 1px dashed #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
  }

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

  .error-message,
  .loading-message {
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

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  @media (max-width: 768px) {
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

    .icon-plus {
      font-size: 1.8rem;
    }
  }
</style>