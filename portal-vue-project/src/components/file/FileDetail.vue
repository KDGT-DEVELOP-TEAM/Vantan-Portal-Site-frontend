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
                <a :href="fileUrl" target="_blank" rel="noopener">
                    <div ref="pdfWrapper" class="pdf-canvas"></div>
                </a>
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
            <div class="detail-titles">
              <div class="file-title">
               {{ fileDetail.title }}
                <div class="file-info-text">
                  ファイル形式: {{ fileExtension.toUpperCase() }}
                  作成日: {{ formatDate(fileDetail.created_at) }}
                </div>
              </div>
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
                v-if="hasPermission('user_manage')"
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
  import { API_BASE_URL, FILE_ENDPOINT } from '@/api/file';
  import * as pdfjsLib from 'pdfjs-dist';
  import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp'];
  
  export default {
    data() {
      return {
        loading: true,
        apiError: null,
        fileDetail: null,
        imageError: false,
      };
    },
    props: {
      fileId: {
        type: String,
        required: true,
      },
      hasPermission: {
        type: Function,
        required: true,
      },
      visible: {
        type: Boolean,
        required: true,
      }
    },
    emits: ['close', 'delete'],
    mounted() {
      this.init();
    },
    watch: {
      fileUrl(newV) {
        this.initialRenderPDF(newV);
      }
    },
    computed: {
      hasFile() {
        return !!this.fileDetail?.attached_file;
      },

      fileUrl() {
        if (!this.hasFile) return '';

        const path = this.fileDetail.attached_file;

        // 絶対URLならそのまま返す
        if (/^https?:\/\//.test(path)) return path;

        // API_BASE_URL とパスを結合
        return new URL(path, API_BASE_URL).href;
      },

      fileExtension() {
        if (!this.fileUrl) return '';

        const cleanUrl = this.fileUrl.split('?')[0]; // ?以降を除外
        return cleanUrl.substring(cleanUrl.lastIndexOf('.')).toLowerCase();
      },

      isPDF() {
        return this.fileExtension === '.pdf';
      },

      isImage() {
        return IMAGE_EXTENSIONS.includes(this.fileExtension);
      } 
    },
    methods: {
      async init() {
        await this.fetchFileDetail();
        this.initialRenderPDF();
      },
      initialRenderPDF(url = this.fileUrl) {
        this.$nextTick(() => {
          if (this.isPDF && url) {
            this.renderPDF(url);
          }
        });
      },
      async renderPDF(url) {
        try {
            const wrapper = this.$refs.pdfWrapper;

            // --- 古いCanvasを全削除（ここが重要） ---
            while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
            }

            // --- 新しいCanvasを作成 ---
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-canvas';
            wrapper.appendChild(canvas);

            const ctx = canvas.getContext('2d');

            const pdf = await pdfjsLib.getDocument(url).promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1.6 });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            canvas.style.width = "100%";
            canvas.style.height = "auto";

            // 不具合残り防止
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
          // エンドポイントとIDをファイル用に変更
          const url = `${API_BASE_URL}${FILE_ENDPOINT}${this.fileId}/`; 
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.fileDetail = response.data; // fileDetailに代入
        } catch (err) {
          console.error("詳細APIエラー:", err.response || err);
          this.apiError = '詳細データの取得中にエラーが発生しました。';
        } finally {
          this.loading = false;
        }
      },
      formatDate(dateString) {
        if (!dateString) return '日付不明';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return '日付不明';
        }
      },
      async downloadFile() {
        if (!this.hasFile) return;
        const token = localStorage.getItem('accessToken');
        // エンドポイントとIDをファイル用に変更
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
        // 削除確認ダイアログを追加
        if (!confirm(`本当にファイル「${this.fileDetail ? this.fileDetail.title : this.fileId}」を削除してもよろしいですか？`)) {
          // ユーザーがキャンセルした場合
          return;
        }

        // ユーザーがOKを押した場合のみ、親コンポーネントにイベントを発火
        this.$emit('delete', this.fileId);
      }
    }
  }
</script>
  
<style scoped>
  /* スタイルは時間割詳細からそのままコピーし、微調整します */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
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
    top: -1px;
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
    width: 100% !important;
    height: auto !important;
    max-height: 530px !important;
    object-fit: contain;
    margin: auto;
    display: block;
    margin: 0 auto;
    object-fit: contain;
    box-sizing: border-box;
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
  .detail-titles {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    flex: 1;
  }
  .file-info-text {
      font-size: 0.95rem;
      color: #555;
      font-weight: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
  }
  .file-title {
    margin: 0;
    font-size: 1rem;
    font-weight: normal;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    color: #F1494C;
    text-align: left;
    letter-spacing: 0.04em;
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
  .action-btn.delete-btn {
      background: #F1494C;
      color: #fff;
      border: none;
      transition: background 0.18s;
  }
  .action-btn.delete-btn:hover {
      background: white;
      color: #F1494C;
      box-shadow: 0 0 0 1px #F1494C inset;
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
  @media (max-width: 580px) {
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
      align-items: flex-end;
    }
    .file-info-text {
      max-width: 100%;
      width: 100%;
      text-align: right;
    }
    .action-buttons-group {
        display: flex;
        gap: 6px;
    }
    .preview-img {
      width: 100% !important;
      height: auto !important;
      max-height: 365px !important;
      display: block;
      margin: 0 auto;
      object-fit: contain;
      box-sizing: border-box;
    }
    ::v-deep(.pdf-canvas) {
      width: 100% !important;
      height: auto !important;
      max-height: 360px !important;
      display: block;
      margin: 0 auto;
      object-fit: contain;
      box-sizing: border-box;
    }
  }
</style>