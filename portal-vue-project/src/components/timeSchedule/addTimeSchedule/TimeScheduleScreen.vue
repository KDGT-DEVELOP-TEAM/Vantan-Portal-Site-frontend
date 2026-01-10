<template>
  <Layout :user-role="userRole" @logout="$emit('logout')">
    <div class="time-schedule-add-page">
      <h2 class="page-header">時間割追加</h2>
      
      <AddTimeScheduleForm 
        :user-role="userRole"
        @success="handleCreationSuccess"
        @cancel="handleCancel"
        class="form-card"
      />
    </div>
  </Layout>
</template>

<script>
import Layout from '../../ui/Layout.vue'; 
import AddTimeScheduleForm from './AddTimeScheduleForm.vue';

export default {
  name: 'TimeScheduleScreen',
  components: {
    Layout,
    AddTimeScheduleForm,
  },
  props: {
    userRole: {
      type: String,
      default: 'viewer',
      validator: (value) => ['admin', 'viewer'].includes(value)
    }
  },
  emits: ['logout'],
  methods: {
    handleCreationSuccess() {
      // alert('時間割が正常に作成されました。'); // ポップアップはリスト画面で表示する方がUXが良い場合がある
      this.$router.push({ name: 'TimeScheduleList' });
    },
    handleCancel() {
      this.$router.push({ name: 'TimeScheduleList' });
    }
  },
}
</script>

<style scoped>
.time-schedule-add-page {
  padding: 20px 40px; 
  max-width: 100%; 
  margin: 0 auto;
}

/* デザイン画像に合わせてヘッダーを調整 */
.page-header {
  text-align: left;
  font-size: 24px;
  margin-top: 15%;
  padding: 0 0 10px 0;
  font-weight: normal;
  color: #F1494C;
  margin-bottom: 30px;
}

.form-card {
  margin-left: 0;
}

/* スマホ対応 */
@media (max-width: 768px) {
  .time-schedule-add-page {
    padding: 20px 10px;
  }
  .page-header {
    font-size: 22px;
    margin-bottom: 20px;
  }
}
</style>