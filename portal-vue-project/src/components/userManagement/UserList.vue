<template>
  <Layout :current-page="$route.name" @logout="$emit('logout')">
    <div class="user-management-page-container">
      <h2 class="page-header">{{ $t('user.list.title') }}</h2>

      <div class="header-controls">
        <div class="search-bar search-bar-with-icon">
          <span class="search-icon" :aria-label="$t('common.search')">
            <span class="material-symbols-outlined">search</span>
          </span>

          <input
            type="text"
            :placeholder="$t('user.list.searchPlaceholder')"
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearchEnter"
          />
        </div>
      </div>

      <div class="user-list-section">
        <div v-if="loading" class="loading-state">
          <p>{{ $t('user.list.loading') }}</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ $t('user.list.fetchFailed') }}: {{ error }}</p>
        </div>

        <div v-else-if="isEmpty" class="empty-state">
          <p>
            {{
              users.length > 0 && searchQuery
                ? $t('user.list.emptyBySearch')
                : $t('user.list.emptyAll')
            }}
          </p>
        </div>

        <div v-else class="user-list-wrapper">
          <UserScrollBar
            :users="filteredUsers"
            :can-manage-users="canManageUsers"
            @toggleUserStatus="handleToggleStatus"
            @deleteUser="deleteUser"
            @editUser="startEdit"
          />
        </div>
      </div>

      <div class="add-user-section">
        <AddUserScreen v-if="!isEditing" @user-created="handleUserCreated" />

        <UserEditScreen
          v-if="isEditing"
          :initial-user="editingUser"
          @userUpdated="finishEdit"
          @error="handleError"
          @cancelEdit="finishEdit"
        />
      </div>

      <button
        v-if="canManageUsers"
        class="global-add-button"
        @click="showModal = true"
        :aria-label="$t('user.list.openAddMenu')"
      >
        <span class="material-symbols-outlined icon-plus">add</span>
      </button>

      <AddOptionsModal
        v-if="canManageUsers && showModal"
        @close="showModal = false"
        @select-option="handleModalSelection"
      />
    </div>
  </Layout>
</template>

<script>
  import Layout from '../ui/Layout.vue';
  import UserScrollBar from './UserScrollBar.vue';
  import AddUserScreen from './addUser/AddUserScreen.vue';
  import UserEditScreen from './UserEditScreen.vue';
  import AddOptionsModal from '../ui/AddOptionsModal.vue';
  import { userApi } from '@/api/userManagementApi';
  import { hasPermission } from '@/utils/permission';

  export default {
    name: 'UserList',

    components: {
      Layout,
      UserScrollBar,
      AddUserScreen,
      UserEditScreen,
      AddOptionsModal,
    },

    emits: ['logout', 'notify'],

    data() {
      return {
        users: [],
        loading: false,
        error: null,
        showModal: false,
        searchQuery: '',
        isEditing: false,
        editingUser: null,
      };
    },

    computed: {
      canManageUsers() {
        return hasPermission('user_manage');
      },

      filteredUsers() {
        if (!this.searchQuery) return this.users;

        const query = this.searchQuery.toLowerCase().trim();

        return this.users.filter((user) => {
          const emailMatch =
            user.email && user.email.toLowerCase().includes(query);

          const roleDisplayName = this.displayRole(user.role).toLowerCase();
          const roleMatch =
            (user.role && user.role.toLowerCase().includes(query)) ||
            roleDisplayName.includes(query);

          // i18n化（検索が壊れないように）
          const statusText = user.is_active
            ? this.$t('user.status.active')
            : this.$t('user.status.inactive');
          const statusMatch = String(statusText).toLowerCase().includes(query);

          const createdDateText = this.formatDate(user.created_at).toLowerCase();
          const createdDateMatch = createdDateText.includes(query);

          return emailMatch || roleMatch || statusMatch || createdDateMatch;
        });
      },

      isEmpty() {
        return !this.loading && !this.error && this.filteredUsers.length === 0;
      },
    },

    mounted() {
      this.fetchUsers();
    },

    methods: {
      handleError(message) {
        this.$emit('notify', message);
      },

      async handleToggleStatus(user) {
        const originalStatus = user.is_active;

        // 楽観的UI
        user.is_active = !originalStatus;

        const actionLabel = user.is_active
          ? this.$t('user.actions.enabled')
          : this.$t('user.actions.disabled');

        try {
          await userApi.update(user.id, { is_active: user.is_active });
          this.$emit(
            'notify',
            this.$t('user.list.notifyStatusChanged', { action: actionLabel })
          );
        } catch (err) {
          // ロールバック
          user.is_active = originalStatus;

          const detail =
            err?.response?.data?.detail ||
            this.$t('common.networkError');

          this.$emit(
            'notify',
            this.$t('user.list.notifyStatusChangeFailed', { detail })
          );
        }
      },

      displayRole(role) {
        switch (role) {
          case 'admin':
            return this.$t('user.roles.admin');
          case 'viewer':
            return this.$t('user.roles.viewer');
          default:
            return role;
        }
      },

      formatDate(datetimeString) {
        if (!datetimeString) return '';
        const date = new Date(datetimeString);

        return date.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },

      startEdit(user) {
        this.isEditing = true;
        this.editingUser = { ...user };

        this.$nextTick(() => {
          const el = document.querySelector('.add-user-section');
          if (!el) return;
          const offset = el.getBoundingClientRect().top + window.scrollY - 150;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        });
      },

      finishEdit() {
        this.isEditing = false;
        this.editingUser = null;
        this.fetchUsers();
      },

      async fetchUsers() {
        this.loading = true;
        this.error = null;

        try {
          const response = await userApi.list();
          this.users = response.data;
        } catch (err) {
          this.error =
            err?.response?.data?.detail ||
            err?.message ||
            this.$t('common.unknownError');
        } finally {
          this.loading = false;
        }
      },

      async deleteUser(userId) {
        try {
          await userApi.delete(userId);

          if (this.isEditing && this.editingUser?.id === userId) {
            this.finishEdit();
          } else {
            this.fetchUsers();
          }

          this.$emit('notify', this.$t('user.list.notifyDeleted'));
        } catch {
          this.$emit('notify', this.$t('user.list.notifyDeleteFailed'));
        }
      },

      handleUserCreated() {
        this.$emit('notify', this.$t('user.list.notifyCreatedRefresh'));
        this.fetchUsers();
      },

      handleSearchEnter() {
        // no-op（Enterで確定するだけ）
      },

      handleModalSelection(option) {
        this.showModal = false;
        this.$emit(
          'notify',
          this.$t('user.list.notifyOptionSelected', { option })
        );
      },
    },
  };
</script>

<style scoped>
  .user-management-page-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
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
  .page-header {
    text-align: left;
    font-size: 24px;
    margin-top: 15%;
    padding: 0 0 10px 0;
    font-weight: normal;
    color: #F1494C;
    margin-bottom: 30px;
  }
  .user-list-section {
    margin-bottom: 40px;
    padding: 10px;
  }
  .loading-state,
  .error-state,
  .empty-state {
    padding: 20px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  .error-state p {
    color: red;
  }
  .add-user-section {
    max-width: 98%;
    margin: 50px auto 0 auto;
    padding: 20px;
    border: 3px solid #f1494c;
    border-radius: 8px;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
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
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>