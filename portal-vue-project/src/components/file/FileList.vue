<template>
    <Layout :user-role="userRole" current-page="ファイル一覧" @logout="$emit('logout')">
        <div class="file-list-page">
            <h2 class="page-header">ファイル一覧</h2> 

            <div v-if="apiError" class="error-message">
            ファイル一覧の取得に失敗しました: {{ apiError }}
            </div>

            <div v-else-if="loading" class="loading-message">
            <p>ファイルを読み込み中です...</p>
            </div>

            <div v-else-if="files.length === 0" class="empty-message">
            <p>現在、公開されているファイルはありません。</p>
            </div>

            <ul v-else class="file-list">
            <FileItem
                v-for="file in files"
                :key="file.id"
                :file="file"
                :api-url="API_URL"
                @view-detail="openModal(file.id)"
            />
            </ul>
        </div>
        
        <FileDetail
            v-if="showDetailModal"
            :file-id="selectedFileId"
            :user-role="userRole"
            @close="closeModal"
            @delete="handleDeleteFile"
        />

    </Layout>
</template>

<script>
import axios from 'axios'; 
import Layout from '../ui/Layout.vue';
// 🚨 新規コンポーネントのインポート
import FileItem from './FileItem.vue';
import FileDetail from './FileDetail.vue'; 

export default {
  name: 'FileList',
  components: {
    Layout, 
    FileItem,
    FileDetail, // モーダルを登録
  },
  props: {
    userRole: {
      type: String,
      default: 'viewer',
      validator: (value) => ['admin', 'viewer'].includes(value)
    }
  },
  data() {
    return {
      files: [],
      loading: true, 
      apiError: null, 
      
      API_URL: 'http://127.0.0.1:8085/api/file/', 

      // 🚨 モーダル管理用のstate
      showDetailModal: false,
      selectedFileId: null, 
    };
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ja-JP');
    },
    // getFileDownloadUrl(fileId) は FileItem.vue に移動

    // 🚨 モーダル表示
    openModal(fileId) {
        this.selectedFileId = fileId;
        this.showDetailModal = true;
    },
    // 🚨 モーダル非表示
    closeModal() {
        this.showDetailModal = false;
        this.selectedFileId = null;
    },

    async fetchFiles() {
      this.loading = true; 
      this.apiError = null; 
      
      try {
        // 🚨 トークンキーを 'accessToken' に修正
        const token = localStorage.getItem('accessToken'); 
        
        if (!token) {
             this.apiError = '認証情報が見つかりません。再ログインしてください。';
             this.loading = false;
             this.$router.push('/login');
             return; 
        }

        const response = await axios.get(this.API_URL, {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
        
        this.files = response.data;
        
      } catch (err) {
        console.error('ファイル一覧の取得エラー:', err);
        
        if (err.response) {
            if (err.response.status === 401 || err.response.status === 403) {
                 this.apiError = 'アクセス権がありません。再ログインしてください。';
                 this.$router.push('/login'); 
            } else {
                 this.apiError = `データの取得中にエラーが発生しました (ステータス: ${err.response.status})。`;
            }
        } else {
             this.apiError = 'サーバーとの通信に失敗しました。ネットワーク接続を確認してください。';
        }

      } finally {
        this.loading = false; 
      }
    },
    
    // 🚨 ファイル削除処理（モーダルから呼ばれる）
    async handleDeleteFile(fileId) {
        if (!confirm('本当にこのファイルを削除しますか？')) return;
        
        const token = localStorage.getItem('accessToken');
        
        try {
            await axios.delete(`${this.API_URL}${fileId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 削除成功後、一覧から該当ファイルを削除し、モーダルを閉じる
            this.files = this.files.filter(file => file.id !== fileId);
            this.closeModal();
            alert('ファイルを削除しました。');

        } catch (error) {
            console.error('ファイル削除エラー:', error);
            alert('ファイルの削除に失敗しました。');
        }
    }
  }
};
</script>

<style scoped>
.file-list-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  text-align: left;
}
/* 🚨 HomeViewのスタイルに合わせた修正 */
.page-header {
  text-align: left;
  font-size: 24px;
  margin-top: 15%;
  padding: 0 0 10px 0;
  font-weight: normal;
  color: #F1494C;
  margin-bottom: 30px;
}

.error-message {
    color: #cc0000;
    font-weight: bold;
    border: 1px solid #ffcccc;
    background-color: #ffebeb;
    padding: 10px;
    border-radius: 5px;
    margin: 20px 0;
    text-align: center;
}
.file-list {
  list-style: none;
  padding: 0;
}
/* 🚨 li.file-item のスタイルは FileItem.vue に移動 */
/* ... (他のスタイルは必要に応じて FileItem.vue に移動) */

.loading-message, .empty-message {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}
</style>