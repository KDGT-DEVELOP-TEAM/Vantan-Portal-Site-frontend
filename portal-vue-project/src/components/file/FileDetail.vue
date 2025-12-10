<template>
    <div
      v-if="visible"
      class="modal-overlay"
      @click.self="$emit('close')"
    >
      <div class="modal-container is-preview">
        <button class="close-button" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
  
        <div v-if="loading" class="loading-message">
          詳細データを読み込み中です...
        </div>
  
        <div v-else-if="apiError" class="error-message">
          詳細データの取得に失敗しました: {{ apiError }}
        </div>
  
        <div v-else class="detail-image-container">
          <div class="img-area">
            <template v-if="hasFile">
              <div v-if="isPDF">
                <div ref="pdfWrapper" class="pdf-canvas"></div>
              </div>
              <template v-else>
                <a :href="fileUrl" target="_blank" rel="noopener">
                  <img
                    v-if="isImage"
                    :src="fileUrl"
                    :alt="fileDetail.title"
                    class="preview-img"
                    @error="imageError = true"
                    v-show="!imageError"
                  />
                  <div v-else class="pdf-placeholder">
                    <span class="material-symbols-outlined pdf-icon">description</span>
                    <div class="pdf-text">{{ fileDetail.title }}</div>
                  </div>
                </a>
              </template>
              <div v-if="imageError && !isPDF && isImage" class="pdf-placeholder error">
                <div class="pdf-text">画像の表示に失敗しました</div>
              </div>
            </template>
            <div v-else class="pdf-placeholder">
              <div class="pdf-text">ファイルは添付されていません。</div>
            </div>
          </div>
          
          <div class="detail-actionbar">
            <div class="file-info-text">
               {{ fileDetail.title }} - アップロード者: {{ fileDetail.user_id_name }}
            </div>
            <div class="action-buttons-group">
              <a
                v-if="hasFile"
                :href="fileUrl"
                target="_blank"
                rel="noopener"
                class="action-btn"
                title="ファイルを新しいタブで表示"
              >
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
              <button
                v-if="hasFile"
                class="action-btn"
                @click="downloadFile"
                title="ダウンロード"
              >
                <span class="material-symbols-outlined">download</span>
              </button>
              <button 
                v-if="userRole === 'admin'" 
                class="action-btn delete-btn" 
                @click.stop="handleDelete"
                title="削除"
              >
                  <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  const API_BASE_URL = 'http://127.0.0.1:8085';
  // 🚨 エンドポイントをファイル用に変更
  const FILE_ENDPOINT = '/api/file/'; 
  import * as pdfjsLib from 'pdfjs-dist';

// 🚨 修正: Vite の new URL() 構文を使用して、pdfjs-dist のワーカースクリプトの URL を正しく取得します。
// （以前の import workerSrc の行は削除またはコメントアウトしてください）
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    // ほとんどの npm インストールでは pdf.worker.js が安定しています。
    // もしこれで動かない場合は 'pdfjs-dist/build/pdf.worker.mjs' を試してください。
    'pdfjs-dist/build/pdf.worker.js',
    import.meta.url
).href;
  
  const IMAGE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp'];
  
  export default {
    data() {
      return {
        loading: true,
        apiError: null,
        fileDetail: null, // 🚨 schedule から fileDetail に名称変更
        imageError: false,
        visible: true, // モーダル表示状態を管理
      };
    },
    // 🚨 props名と型を修正 (scheduleId -> fileId)
    props: {
      fileId: {
        type: String,
        required: true,
      },
      userRole: { 
        type: String,
        required: true,
        validator: (value) => ['admin', 'viewer'].includes(value)
      },
    },
    emits: ['close', 'delete'],
    async mounted() {
      await this.fetchFileDetail();
      this.initialRenderPDF();
    },
    watch: {
      fileUrl(newV) {
        this.initialRenderPDF(newV);
      }
    },
    computed: {
      hasFile() {
        // 🚨 attached_file_url の存在でファイル有無を判定
        return this.fileDetail && this.fileDetail.attached_file; 
      },
      // 🚨 ファイルの拡張子を取得
      fileExtension() {
          if (!this.fileUrl) return '';
          const url = new URL(this.fileUrl);
          const path = url.pathname;
          return path.substring(path.lastIndexOf('.')).toLowerCase();
      },
      isPDF() {
        return this.fileExtension === '.pdf';
      },
      isImage() {
          return IMAGE_EXTENSIONS.includes(this.fileExtension);
      },
      fileUrl() {
        if (!this.hasFile) return '';
        let urlPath = this.fileDetail.attached_file; // Djangoから返る attached_file の値
        
        // 1. 既に完全なURL（http://, https://）が返されている場合はそのまま返す
        if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
          return urlPath;
        }
        
        // 2. 相対パスの場合、ベースURLと結合して完全なURLを生成
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const path = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
        
        return baseUrl + path;
      },
    },
    methods: {
      initialRenderPDF(url = this.fileUrl) {
        this.$nextTick(() => {
          if (this.isPDF && url) {
            this.renderPDF(url);
          }
        });
      },
      async renderPDF(url) {
        // --- PDF表示ロジックは時間割詳細からそのまま継承 ---
        try {
          const wrapper = this.$refs.pdfWrapper;
          while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
          }
          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-canvas';
          wrapper.appendChild(canvas);
          const ctx = canvas.getContext('2d');
          const pdf = await pdfjsLib.getDocument(url).promise;
          const page = await pdf.getPage(1);
          // モーダルサイズに合わせてビューポートを調整
          const viewport = page.getViewport({ scale: 1.6 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: ctx,
            viewport
          }).promise;
        } catch (e) {
          console.error("PDF描画エラー:", e);
          this.imageError = true;
        }
      },
      async fetchFileDetail() {
        this.loading = true;
        this.apiError = null;
        this.imageError = false;
        const token = localStorage.getItem('accessToken');
        if (!token) {
          this.apiError = '認証トークンが見つかりません。';
          this.loading = false;
          return;
        }
        try {
          // 🚨 エンドポイントとIDをファイル用に変更
          const url = `${API_BASE_URL}${FILE_ENDPOINT}${this.fileId}/`; 
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.fileDetail = response.data; // 🚨 fileDetailに代入
        } catch (err) {
          console.error("詳細APIエラー:", err.response || err);
          this.apiError = '詳細データの取得中にエラーが発生しました。';
        } finally {
          this.loading = false;
        }
      },
      async downloadFile() {
        if (!this.hasFile) return;
        const token = localStorage.getItem('accessToken');
        // 🚨 エンドポイントとIDをファイル用に変更
        const fileUrl = `${API_BASE_URL}${FILE_ENDPOINT}${this.fileId}/?download=true`; 
        try {
          const response = await axios.get(fileUrl, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          const contentDisposition = response.headers['content-disposition'];
          let fileName = 'file_download';
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/i);
            if (match && match[1]) {
              fileName = decodeURI(match[1]); // ファイル名がUTF-8エンコードされている可能性を考慮
            }
          } else if (this.fileDetail.attached_file) {
            fileName = this.getFileName(this.fileDetail.attached_file);
          }
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error("ファイルダウンロードエラー:", err.response || err);
          alert('ファイルのダウンロード中にエラーが発生しました。');
        }
      },
      getFileName(url) {
        if (!url) return 'ファイル名不明';
        try {
          return url.split('/').pop().split('?')[0] || 'ファイル';
        } catch {
          return 'ファイル';
        }
      },
      handleDelete() {
        // 🚨 delete イベントを emit し、fileIdを渡す
        this.$emit('delete', this.fileId); 
        // 親コンポーネントで削除が完了したら、親がモーダルを閉じる方が安全ですが、
        // 今回は既存コードに合わせ子で visible を false にします。
        // this.visible = false; 
      }
    }
  }
  </script>
  
  <style scoped>
  /* 🚨 スタイルは時間割詳細からそのままコピーし、微調整します */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.08);
    display: flex;
    align-items: center; 
    justify-content: center;
    min-height: 100vh;
    z-index: 1000;
  }
  .modal-container.is-preview {
    background: #fff;
    border-radius: 10px;
    margin: 0; 
    width: 96vw;
    max-width: 980px;
    box-shadow: 0 6px 24px 0 rgba(80,80,80,0.14);
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .close-button {
    position: absolute;
    top: 10px; /* 調整 */
    right: 17px;
    background: none;
    border: none;
    color: #f55;
    font-size: 1.4rem;
    z-index: 105;
    cursor: pointer;
    transition: color 0.18s;
    padding: 2px;
  }
  .close-button:hover {
    color: #222;
  }
  .detail-image-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    position: relative;
  }
  .img-area {
    background: #d8d8d8;
    border-radius: 0.4rem;
    margin: 32px 18px 14px 18px;
    width: calc(100% - 36px);
    height: 560px;
    min-height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .preview-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    margin: auto;
    display: block;
  }
  .pdf-placeholder {
    width: 100%;
    height: 100%;
    min-height: 140px;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    font-size: 1.08rem;
    color: #222;
  }
  .pdf-placeholder .pdf-icon {
    font-size: 2.4rem;
    color: #848484;
    margin-bottom: 7px;
  }
  .pdf-placeholder .pdf-text {
    font-size: 1.04rem;
    font-weight: 550;
    color: #111;
    letter-spacing: 0.04em;
  }
  .pdf-placeholder.error .pdf-text {
    color: #d22;
  }
  .detail-actionbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between; /* 左右に要素を分ける */
    gap: 6px;
    padding: 10px 20px 18px 20px;
  }
  .file-info-text { /* 🚨 追加: ファイル情報テキスト */
      font-size: 0.95rem;
      color: #555;
      font-weight: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 60%;
  }
  .action-buttons-group {
      display: flex;
      gap: 6px;
  }
  .action-btn {
    background: #fff;
    border: 1px solid #ededed;
    border-radius: 6px;
    padding: 0;
    min-width: 36px;
    min-height: 32px;
    height: 32px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #222;
    font-size: 1.20rem;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.09);
    transition: background 0.16s, color 0.13s;
  }
  .action-btn:hover {
    background: #f8f7f7;
    color: #111;
  }
  /* 🚨 削除ボタンのスタイル修正 */
  .action-btn.delete-btn {
      background: #F1494C;
      color: #fff;
      border: none;
      transition: background 0.18s;
  }
  .action-btn.delete-btn:hover {
      background: #cc0000;
      color: #fff;
  }
  /* 状態・エラー／ローディング */
  .error-message, .loading-message {
    padding: 18px;
    margin: 18px;
    border-radius: 6px;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }
  .error-message {
    background: #ffeaea;
    color: #e04434;
    border: 1px solid #facccc;
  }
  .loading-message {
    background: #ebf2ff;
    color: #367eea;
    border: 1px solid #b1c8f7;
  }
  .material-symbols-outlined {
      font-size: 1.15rem;
      vertical-align: middle;
  }
  ::v-deep(.pdf-canvas) {
    width: 100% !important;
    height: auto !important;
    max-height: 530px !important;
    display: block;
    margin: 0 auto;
    object-fit: contain;
    box-sizing: border-box;
  }
  /* レスポンシブスタイルはそのまま適用 */
  @media (max-width: 680px) {
    .modal-container.is-preview {
      max-width: 90vw;
      border-radius: 5px;
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .img-area {
      min-height: 260px;
      max-height: 430px !important;
      height: 64vw;
      width: 84vw;
      border-radius: 0.24rem;
      margin: 16px auto 12px auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-button {
      top: 5px;
      right: 13px;
    }
    .detail-actionbar {
      padding: 7px 7vw 14px 7vw;
      gap: 4px;
      flex-direction: column; /* 縦並びに変更 */
      align-items: flex-end;
    }
    .file-info-text {
      max-width: 100%;
      width: 100%;
      text-align: right;
    }
    ::v-deep(.pdf-canvas) {
      width: 100% !important;
      height: auto !important;
      max-height: 330px !important;
      display: block;
      margin: 0 auto;
      object-fit: contain;
      box-sizing: border-box;
    }
  }
  </style>