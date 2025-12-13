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
                    >
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
                        {{ users.length > 0 && searchQuery ? '検索条件に一致するユーザーが見つかりません。' : '登録されているユーザーはいません。' }}
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
                <!-- 追加モード -->
                <AddUserScreen
                    v-if="!isEditing"
                    @user-created="handleUserCreated"
                />

                <!-- 編集モード（UserEditScreen を表示） -->
                <UserEditScreen
                    v-else
                    :initialUser="editingUser"
                    @cancelEdit="finishEdit"
                    @userUpdated="finishEdit"
                />
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
    
        </div>
    </Layout>
  </template>
  
  <script>
  import { useRouter } from 'vue-router'; 
  import Layout from '../ui/Layout.vue';
  import UserScrollBar from './UserScrollBar.vue'; 
  import AddUserScreen from './addUser/AddUserScreen.vue'; 
  import UserEditScreen from './UserEditScreen.vue';
  import AddOptionsModal from '../ui/AddOptionsModal.vue';

  // APIのベースURLを明確に定義（コンポーネント外に定義）
  const API_BASE_URL = 'http://127.0.0.1:8085';
  const USERS_API_URL = `${API_BASE_URL}/api/users/`;

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
            default: 'viewer'
        }
    },
    emits: ['logout'],

    data() {
      return {
        users: [],
        loading: true,
        error: null,
        showModal: false, 
        router: null, 
        searchQuery: '', 
        isEditing: false,
        editingUser: null,
      };
    },
    
    // フィルタリングロジック
    computed: {
      filteredUsers() {
        // キーワードが空の場合は、全ユーザーリストを返す
        if (!this.searchQuery) {
          return this.users;
        }

        const query = this.searchQuery.toLowerCase().trim();

        return this.users.filter(user => {
          // 1. メールアドレスの検索
          const emailMatch = user.email && user.email.toLowerCase().includes(query);
          
          // 2. ロールの検索 (日本語/英語両方で検索可能にする)
          const roleDisplayName = this.displayRole(user.role).toLowerCase();
          const roleMatch = user.role.toLowerCase().includes(query) || roleDisplayName.includes(query);

          // 3. 有効/無効ステータスの検索 (日本語/英語両方で検索可能にする)
          const statusText = user.is_active ? '有効' : '無効';
          const statusMatch = statusText.includes(query) || 
                              (user.is_active ? 'active'.includes(query) : 'inactive'.includes(query));

          // 作成日の検索 (フォーマットされた日付文字列で検索)
          const createdDateText = this.formatDate(user.created_at).toLowerCase();
          const createdDateMatch = createdDateText.includes(query);

          // いずれかにマッチすればtrue
          return emailMatch || roleMatch || statusMatch || createdDateMatch;
        });
      },
      
      isEmpty() {
           // 読み込み中/エラー時でなく、かつフィルタリング後のリストが空の場合
           return !this.loading && !this.error && this.filteredUsers.length === 0;
      }
    },

    created() {
        this.router = useRouter(); 
    },
  
    mounted() {
      this.fetchUsers();
    },

    methods: {
      /**
       * ロール名を日本語に変換するヘルパー (computedで使用)
       */
      displayRole(role) {
        switch (role) {
          case 'admin':
            return '管理者';
          case 'viewer':
            // UserScrollBar.vueの定義に合わせて'保護者'を採用
            return '保護者'; 
          default:
            return role;
        }
      },
      formatDate(datetimeString) {
        if (!datetimeString) return '';
        const date = new Date(datetimeString);
        // タイムゾーンを考慮した日本語ロケールでフォーマット
        return date.toLocaleString('ja-JP', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
    },
    startEdit(user) {
        this.isEditing = true;
        this.editingUser = user;

        this.$nextTick(() => {
            const el = document.querySelector(".add-user-section");
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const offset = rect.top + window.scrollY - 150; // ← 上に少し余白を残す

            window.scrollTo({
                top: offset,
                behavior: "smooth"
            });
        });
    },
    finishEdit() {
        this.isEditing = false;
        this.editingUser = null;
        this.fetchUsers();
    },
      
      /**
       * ユーザー一覧をバックエンドから取得する関数
       */
      async fetchUsers() {
        this.loading = true;
        this.error = null;
        
        const accessToken = localStorage.getItem('accessToken'); 
        
        if (!accessToken) {
          this.error = '認証トークンが見つかりません。ログインが必要です。';
          this.loading = false;
          this.router.push('/login'); 
          return;
        }
        
        try {
          // バックエンド検索は使用しないため、クエリパラメータは付与しない
          const response = await fetch(USERS_API_URL, { 
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`, 
              'Content-Type': 'application/json',
            },
          });
      
          if (!response.ok) {
            let detail = `HTTP Error: ${response.status} (${response.statusText})`;
            
            try {
                const errorBody = await response.json();
                detail = errorBody.detail || JSON.stringify(errorBody);
            } catch (e) {
                detail += '。サーバー応答がJSONではありません。';
            }
      
            if (response.status === 401 || response.status === 403) {
              this.router.push('/login');
              throw new Error(`セッション切れまたはアクセス権限がありません: ${detail}`);
            }
            
            throw new Error(detail);
          }
          
          this.users = await response.json();
          
        } catch (err) {
          console.error("ユーザー一覧取得エラー:", err);
          this.error = err.message || '不明なエラーが発生しました。';
        } finally {
          this.loading = false;
        }
      },
      
      /**
       * UserDeleteButtonから削除イベントを受け取った際の処理
       */
      handleUserDeleted() {
          alert(`ユーザーが削除されました。リストを更新します。`);
          this.fetchUsers(); 
      },
      
      /**
       * AddUserScreenで新規ユーザー登録が成功した際の処理
       */
      handleUserCreated() {
          alert(`新規ユーザーが登録されました。リストを更新します。`);
          this.fetchUsers(); 
      },
      
      /**
       * 検索ボックスでEnterを押した際の処理（何も書かなくて良い）
       */
      handleSearchEnter() {
        //　何もしない
      },
      
      handleModalSelection(option) {
        console.log(`【管理者機能】${option}が選択されました。該当ページに遷移します。`);
        this.showModal = false; 
      }
    }
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