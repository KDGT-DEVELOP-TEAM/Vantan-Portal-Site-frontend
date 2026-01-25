<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="time-schedule-add-page">
      <h2 class="page-header">{{ $t('timeschedule.add.title') }}</h2>

      <AddTimeScheduleForm
        @success="goBackList"
        @cancel="goBackList"
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
    emits: ['logout'],
    methods: {
      goBackList() {
        this.$router.push({ name: 'TimeScheduleList' });
      }
    },
  };
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
    color: #f1494c;
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