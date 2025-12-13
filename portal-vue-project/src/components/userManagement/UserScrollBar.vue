<template>
    <div class="user-scrollbar-container">
      <div class="user-list-scroll">
        <table class="user-table">
          <thead>
            <tr>
              <th>メールアドレス</th>
              <th>ロール</th>
              <th>有効/無効</th>
              <th>作成日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.email }}</td>
              <td class="new_line">{{ displayRole(user.role) }}</td>
              <td>
                <span :class="{'active': user.is_active, 'inactive': !user.is_active}">
                  {{ user.is_active ? '有効' : '無効' }}
                </span>
              </td>
              <td class="new_line">{{ formatDate(user.created_at) }}</td>
              <td class="action-buttons">
  
                <!-- 有効/無効ボタン -->
                <UserEnableButton
                  :user="user"
                  :is-current-user-admin="isCurrentUserAdmin"
                  @updated="handleStatusUpdated"
                />
  
                <!-- 編集ボタン -->
                <UserEditButton
                  :user="user"
                  :is-current-user-admin="isCurrentUserAdmin"
                  @click="handleEditUser(user)"
                />
  
                <!-- 削除ボタン -->
                <UserDeleteButton
                  :user-id="user.id"
                  :is-current-user-admin="isCurrentUserAdmin"
                  @deleted="handleUserDeleted"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  
  <script>
  import UserDeleteButton from '../userManagement/UserDeleteButton.vue';
  import UserEditButton from '../userManagement/UserEditButton.vue';
  import UserEnableButton from '../userManagement/UserEnableButton.vue';
  
  export default {
    name: "UserListTable",
  
    components: {
      UserDeleteButton,
      UserEditButton,
      UserEnableButton,
    },
  
    props: {
      users: {
        type: Array,
        required: true
      },
      isCurrentUserAdmin: {
        type: Boolean,
        required: true
      }
    },
  
    emits: ["userDeleted", "editUser", "userStatusUpdated"],
  
    methods: {
      /** ユーザー削除時 */
      handleUserDeleted(userId) {
        this.$emit("userDeleted", userId);
      },
  
      /** 編集クリック時 */
      handleEditUser(user) {
        this.$emit("editUser", user);
      },
  
      /** 有効/無効切替時 */
      handleStatusUpdated() {
        this.$emit("userStatusUpdated");
      },
  
      /** ロール名変換 */
      displayRole(role) {
        switch (role) {
          case "admin":
            return "管理者";
          case "viewer":
            return "保護者";
          default:
            return role;
        }
      },
  
      /** 日付フォーマット */
      formatDate(datetimeString) {
        if (!datetimeString) return "";
        const date = new Date(datetimeString);
  
        return date.toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    }
  };
  </script>
  
  
  <style scoped>
  /* スクロールバーのためのスタイル */
  .user-scrollbar-container {
    height: 100%; 
    max-height: 70vh; 
    overflow: hidden;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    background: white;
  }

  .user-list-scroll {
    max-height: 400px;
    overflow-y: scroll;
  }

  /* テーブルのスタイル（PC用） */
  .user-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    min-width: 800px;
  }
  
  .user-table th,
  .user-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  .user-table th {
    background-color: #f8f8f8;
    color: #555;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .user-table tr:hover {
    background-color: #f9f9f9;
  }

  .new_line {
    white-space: nowrap;
  }

  .active {
    color: #4ABC36;
    font-weight: bold;
  }

  .inactive {
    color: rgb(89, 89, 89);
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* ========== スマホ版スタイル ========== */
  @media (max-width: 684px) {
    .user-scrollbar-container {
      max-height: none;
      border: 1.2px solid #E0E0E0; /* 薄いグレー */
      border-radius: 9px;
      box-shadow: 0 1.5px 0 #eee;
      background: #fff;
      margin: 0 0 16px 0;
      padding: 0;
    }

    .user-list-scroll {
      max-height: 550px;
      overflow-y: scroll;
      overflow-x: auto;
      border: none;
      box-shadow: none;
      background: none;
      padding: 0;
    }

    .user-table {
      display: table;
      width: 100%;
      background: #fff;
      min-width: 600px; /* 縦スクロール前提でスマホでも横スクロールを許可 */
      border: 1.2px solid #E0E0E0;
      border-radius: 0 0 9px 9px;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 14px;
    }

    .user-table thead {
      display: table-header-group;
    }
    .user-table th,
    .user-table td {
      padding: 6px 7px;
      text-align: center;
      border-bottom: 1px solid #F1F1F1;
      font-size: 14px;
      vertical-align: middle;
      white-space: nowrap;
    }
    .user-table th {
      background: #F8F8F8;
      color: #2c2c2c;
      font-weight: 600;
      font-size: 13.5px;
      position: sticky;
      top: 0;
      z-index: 2;
      letter-spacing: 0.03em;
    }
    .user-table tr {
      background: #fff;
      border: none;
      box-shadow: none;
      border-radius: 0;
      margin-bottom: 0;
      position: static;
      padding: 0;
      transition: background .08s;
    }
    .user-table tr:hover {
      background-color: #f9f9f9;
    }
    .user-table td {
      border-bottom: 1px solid #F4F4F4;
      font-size: 14px;
      padding: 7px 6px;
      background: none;
      box-shadow: none;
    }
    .user-table td:not(:last-child) {
      border-right: 1px solid #F4F4F4;
    }
    /* 見出しのアイコンや項目幅調整 */
    .user-table th,
    .user-table td {
      min-width: 57px;
    }

    .active {
      color: #4ABC36 !important;
      font-weight: 700;
      background: #ecf9ef;
      border-radius: 4px;
      font-size: 13px;
      padding: 2.5px 10px;
      display: inline-block;
      letter-spacing: .05em;
      margin-left: 0;
      border: 1px solid #A4E0B2;
      min-width: 38px;
    }
    .inactive {
      color: #BBBBBB !important;
      background: #F5F5F5;
      border-radius: 4px;
      font-size: 13px;
      padding: 2.5px 10px;
      display: inline-block;
      letter-spacing: .05em;
      margin-left: 0;
      border: 1px solid #E0E0E0;
      min-width: 38px;
    }
    .action-buttons {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: center;
      background: none;
      padding: 0;
    }
    .action-buttons button,
    .action-buttons .delete-button {
      font-size: 12.8px !important;
      padding: 5px 10px !important;
      min-width: 42px !important;
      border-radius: 5px !important;
      white-space: nowrap;
      line-height: 1.2;
    }

    /* 削除ボタンは赤・他はグレー */
    .action-buttons .delete-button {
      background: #F1494C !important;
      color: #fff !important;
      border: none !important;
      font-weight: 600;
      transition: background .2s, color .2s;
    }
    .action-buttons .delete-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .action-buttons .delete-button:hover {
      background: #fff !important;
      color: #F1494C !important;
      box-shadow: 0 0 0 1.1px #F1494C inset !important;
    }

    /* +ボタン固定位置 */
    .global-add-button {
      right: 14px !important;
      bottom: 14px !important;
      width: 50px !important;
      height: 50px !important;
      font-size: 34px !important;
      box-shadow: 0 2.5px 12px rgba(241,73,76,0.18) !important;
      border-radius: 50% !important;
      background: #F1494C;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .global-add-button .icon-plus {
      font-size: 2.2rem !important;
      color: #fff;
    }
  }
  </style>