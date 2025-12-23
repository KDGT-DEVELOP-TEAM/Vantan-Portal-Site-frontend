<template>
  <Layout :user-role="userRole" current-page="ユーザー管理" @logout="$emit('logout')">
    <div class="user-management-page-container">
      <h2 class="page-header">ユーザーリスト</h2>

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
          />
        </div>
      </div>

      <div class="user-list-section">
        <div v-if="loading" class="loading-state">
          <p>ユーザー一覧を読み込み中です...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>ユーザー一覧の取得に失敗しました: {{ error }}</p>
        </div>

        <div v-else-if="isEmpty" class="empty-state">
          <p>
            {{ users.length > 0 && searchQuery
              ? '検索条件に一致するユーザーが見つかりません。'
              : '登録されているユーザーはいません。' }}
          </p>
        </div>

        <div v-else class="user-list-wrapper">
          <UserScrollBar
            :users="filteredUsers"
            :is-current-user-admin="userRole === 'admin'"
            @user-deleted="handleUserDeleted"
            @editUser="startEdit"
            @user-status-updated="fetchUsers"
          />
        </div>
      </div>

      <div class="add-user-section">
        <AddUserScreen v-if="!isEditing" @user-created="handleUserCreated" />
        <UserEditScreen
          v-else
          :initialUser="editingUser"
          @cancelEdit="finishEdit"
          @userUpdated="finishEdit"
        />
      </div>

      <button v-if="userRole === 'admin'" class="global-add-button" @click="showModal = true">
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
import UserScrollBar from './UserScrollBar.vue';
import AddUserScreen from './addUser/AddUserScreen.vue';
import UserEditScreen from './UserEditScreen.vue';
import AddOptionsModal from '../ui/AddOptionsModal.vue';
import { userApi } from '@/api/userManagementApi';

export default {
  components: {
    Layout,
    UserScrollBar,
    AddUserScreen,
    UserEditScreen,
    AddOptionsModal,
  },
  props: {
    userRole: {
      type: String,
      default: 'viewer',
    },
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
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase().trim();
      return this.users.filter((user) => {
        const emailMatch = user.email && user.email.toLowerCase().includes(query);
        const roleDisplayName = this.displayRole(user.role).toLowerCase();
        const roleMatch = user.role.toLowerCase().includes(query) || roleDisplayName.includes(query);
        const statusText = user.is_active ? '有効' : '無効';
        const statusMatch =
          statusText.includes(query) ||
          (user.is_active ? 'active'.includes(query) : 'inactive'.includes(query));
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
    displayRole(role) {
      switch (role) {
        case 'admin':
          return '管理者';
        case 'viewer':
          return '保護者';
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
      this.editingUser = user;
      this.$nextTick(() => {
        const el = document.querySelector('.add-user-section');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offset = rect.top + window.scrollY - 150;
        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
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
        this.error = err.response?.data?.detail || err.message || '不明なエラーが発生しました。';
        if (err.response?.status === 401 || err.response?.status === 403) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    handleUserDeleted() {
      this.$emit('notify', 'ユーザーが削除されました。リストを更新します。');
      this.fetchUsers();
    },

    handleUserCreated() {
      this.$emit('notify', '新規ユーザーが登録されました。リストを更新します。');
      this.fetchUsers();
    },

    handleSearchEnter() {
      // 特に処理なし
    },

    handleModalSelection(option) {
      this.showModal = false;
      this.$emit('notify', `管理者機能「${option}」が選択されました。該当ページに遷移します。`);
    },
  },
};
</script>

  
  <style scoped>
  /* スタイルは変更なし */
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
  
  .loading-state, .error-state, .empty-state {
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
      margin: 50px auto 0 auto; /* 上に50px、左右中央、下0 */
      padding: 20px;
      border: 3px solid #f1494c; 
      border-radius: 8px;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
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
  .material-symbols-outlined {
    font-variation-settings:
        'FILL' 1, 
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;
  }
  </style>