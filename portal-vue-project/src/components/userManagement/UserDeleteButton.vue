<template>
    <button 
      @click="deleteUser" 
      :disabled="isLoading || !isCurrentUserAdmin"
      class="delete-button"
    >
      <span v-if="isMobile">
        <span class="material-symbols-outlined delete-icon">delete</span>
      </span>
  
      <span v-else>
        {{ isLoading ? '削除中...' : 'アカウントを削除' }}
      </span>
    </button>
  </template>
  
  <script>
  const API_BASE = 'http://127.0.0.1:8085'; // ← ここを正しいベースURLに固定
  
  export default {
    name: "UserDeleteButton",
  
    props: {
      userId: {
        type: String,
        required: true
      },
      isCurrentUserAdmin: {
        type: Boolean,
        required: true
      }
    },
  
    emits: ["deleted"],
  
    data() {
      return {
        isMobile: false,
        isLoading: false
      };
    },
  
    mounted() {
      this.checkMobile();
      window.addEventListener("resize", this.checkMobile);
    },
  
    beforeUnmount() {
      window.removeEventListener("resize", this.checkMobile);
    },
  
    methods: {
      checkMobile() {
        this.isMobile = window.innerWidth < 700;
      },
  
      async deleteUser() {
        if (this.isLoading || !this.isCurrentUserAdmin) return;

        if (!confirm("本当にこのユーザーを削除しますか？この操作は元に戻せません。")) {
            return;
        }

        this.isLoading = true;

        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
            alert("認証トークンが見つかりません。ログインしてください。");
            this.isLoading = false;
            return;
            }

            // 🔥 UUID をそのまま使う（ここが超重要）
            const id = this.userId;

            const url = `${API_BASE}/api/users/${id}/`;
            console.log("DELETE URL:", url);

            const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
            });

            console.log("DELETE status:", response.status);

            if (response.status === 204) {
            this.$emit("deleted", id);
            } else {
            let bodyText = '';
            try {
                const json = await response.json();
                bodyText = JSON.stringify(json);
            } catch (e) {
                bodyText = await response.text();
            }
            throw new Error(bodyText || `削除エラー: ${response.status}`);
            }

        } catch (err) {
            console.error("deleteUser error:", err);
            alert(`削除に失敗しました: ${err.message}`);
        } finally {
            this.isLoading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .delete-button {
    padding: 10px 15px;
    background-color: #F1494C;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
    white-space: nowrap;
    min-width: 120px;
  }
  .delete-button:hover {
    background-color: white;
    box-shadow: 0 0 0 2px #F1494C inset;
    color: #F1494C;
  }
  .delete-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .material-symbols-outlined.delete-icon {
    font-size: 16px;
    vertical-align: middle;
  }
  </style>
  