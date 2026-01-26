<template>
  <div class="add-user-screen-container">
    <div class="header">
      <h2>{{ $t('user.add.title') }}</h2>
    </div>

    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>
    <div v-if="generalError" class="error-alert">
      {{ generalError }}
    </div>

    <AddUserForm
      :is-loading="isLoading"
      :errors="validationErrors"
      @submit="handleFormSubmit"
      @openBulkRegister="handleOpenBulkRegister"
    />

    <BulkRegisterModal
      :is-visible="isBulkRegisterModalVisible"
      @close="handleCloseBulkRegister"
      @registered="handleBulkRegisterSuccess"
    />
  </div>
</template>

<script>
  import AddUserForm from './AddUserForm.vue';
  import BulkRegisterModal from './AddUsersLumpsumScreen.vue';
  import { userApi } from '@/api/userManagementApi';

  export default {
    name: 'AddUserScreen',
    components: {
      AddUserForm,
      BulkRegisterModal,
    },
    emits: ['userCreated'],

    data() {
      return {
        isLoading: false,
        generalError: null, // string | null
        successMessage: null, // string | null
        validationErrors: {}, // Record<string, string[]>
        isBulkRegisterModalVisible: false,
      };
    },

    computed: {
      /**
       * 暫定対応：
       * - サーバがまだ role 依存の場合に備えて env で切替可能にする
       * - VITE_SEND_ROLE="true" のときだけ role をpayloadに含める
       */
      SHOULD_SEND_ROLE() {
        return import.meta.env.VITE_SEND_ROLE === 'true';
      },
    },

    methods: {
      clearValidationErrors() {
        this.validationErrors = {};
      },

      async handleFormSubmit(formData) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.generalError = null;
        this.successMessage = null;
        this.clearValidationErrors();

        const payload = {
          ...formData,
          ...(this.SHOULD_SEND_ROLE ? {} : { role: undefined }),
        };

        try {
          const { data } = await userApi.create(payload);

          this.successMessage = this.$t('user.add.created', { email: data.email });
          this.$emit('userCreated');

          setTimeout(() => {
            this.successMessage = null;
          }, 2000);
        } catch (error) {
          const status = error?.response?.status;

          if (status === 400) {
            this.validationErrors = error.response.data || {};
            this.generalError = this.$t('user.add.errors.invalidInput');
          } else if (status === 403) {
            this.generalError = this.$t('user.add.errors.forbidden');
          } else {
            this.generalError = this.$t('user.add.errors.server');
          }
        } finally {
          this.isLoading = false;
        }
      },
      handleOpenBulkRegister() {
        this.isBulkRegisterModalVisible = true;
      },
      handleCloseBulkRegister() {
        this.isBulkRegisterModalVisible = false;
      },
      handleBulkRegisterSuccess() {
        this.successMessage = this.$t('user.add.bulkRegistered');
        this.$emit('userCreated');
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
    },
  };
</script>

<style scoped>
  .add-user-screen-container {
    padding: 0;
    margin: 0;
    box-shadow: none;
  }

  .header {
    margin-top: -20px;
    margin-bottom: 25px;
    border-bottom: none;
    padding-bottom: 0;
    text-align: left;
  }

  h2 {
    font-size: 1.5em;
    font-weight: bold;
    color: #F1494C;
  }

  .success-alert {
    padding: 15px;
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .error-alert {
    padding: 15px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin-bottom: 20px;
    font-weight: bold;
  }
</style>