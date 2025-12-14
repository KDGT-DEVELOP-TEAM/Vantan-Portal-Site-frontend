<template>
    <li class="file-card" @click="$emit('view-detail', file.id)">
      <div class="file-card-header">
        <span class="file-card-title">{{ file.title }}</span>
        <span class="file-card-format">
          ファイル形式: {{ fileExtension.toUpperCase() }} | 公開日: {{ formatDate(file.created_at) }}
        </span>
      </div>
      
      <div class="file-card-image-area">
        
        <template v-if="attachedFileUrl && isPDF && !imageLoadError">
            <div class="pdf-preview-wrapper" ref="pdfWrapper"/>
            <div v-if="isPDFRendering" class="rendering-overlay">
                <span class="material-symbols-outlined loading-icon">progress_activity</span>
            </div>
            <div class="file-card-image-overlay"></div>
        </template>
        
        <template v-else-if="attachedFileUrl && isImage && !imageLoadError">
          <div class="file-image-wrapper">
            <img 
              :src="attachedFileUrl" 
              :alt="file.title + 'のプレビュー'" 
              class="file-preview-image" 
              @error="handleImageError"
            />
            <div class="file-card-image-overlay"></div>
          </div>
        </template>
        
        <template v-else>
          <span class="file-card-image-text">
            <span class="material-symbols-outlined icon-display">{{ fileIcon }}</span>
          </span>
        </template>
      </div>
      
      <div class="file-card-actions" @click.stop>
        <a 
          :href="getFileDownloadUrl(file.id)" 
          target="_blank"
          class="action-btn file-card-download"
          @click.stop
        >
          <span class="material-symbols-outlined">download</span>
        </a>
        
        <button 
          v-if="userRole === 'admin'" 
          class="action-btn delete-btn" 
          @click.stop="$emit('delete', file.id)"
          title="ファイルを削除"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </li>
</template>

<script>
// PDFレンダリングに必要なライブラリをインポート
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'; 

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const FILE_ENDPOINT = '/api/file/';

export default {
  name: 'FileItem',
  props: {
    file: {
      type: Object,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      validator: (value) => ['admin', 'viewer'].includes(value)
    },
    apiBaseUrl: {
      type: String,
      required: true,
    }
  },
  emits: ['view-detail', 'delete'],
  data() {
      return {
          imageLoadError: false,
          isPDFRendering: false,
      };
  },
  mounted() { // 言われた修正だと動作しなかったため以下の方法に修正いたしました。
    if (this.attachedFileUrl) {
      this.renderPdfPreview();
    }
  },
  watch: {
    attachedFileUrl(newUrl) {
      if (newUrl) {
        this.renderPdfPreview();
      }
    }
  },
  computed: {
    /**
     * 添付ファイルのURLから拡張子を取得する
     */
    fileExtension() {
        const urlPath = this.file.attached_file; 
        if (!urlPath) return '不明';
        
        const path = urlPath.split('/').pop();
        const parts = path.split('.');
        if (parts.length > 1) {
            const cleanExt = parts.pop().split('?')[0];
            return cleanExt.toLowerCase();
        }
        
        return '不明';
    },

    /**
     * PDFファイルかどうかの判定
     */
    isPDF() {
        return this.fileExtension === 'pdf';
    },

    /**
     * 添付ファイルの完全なURLを構築
     */
    attachedFileUrl() {
        if (!this.file.attached_file || !this.apiBaseUrl) return null;
        
        const urlPath = this.file.attached_file;
        
        if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
            return urlPath;
        }                                        
        const baseUrl = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
        const path = urlPath.startsWith('/') ? urlPath : '/' + urlPath;                                        
        return baseUrl + path;
    },

    /**
     * 画像のみを判定（PDF は別途 isPDF で判定）
     */
    isImage() {
        const ext = this.fileExtension;
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp'].includes(ext);
    },

    /**
     * ファイル形式に基づいた Material Symbols アイコン名を返す
     */
    fileIcon() {
        const ext = this.fileExtension;
        if (ext === 'pdf') {
            return 'picture_as_pdf';
        } else if (this.isImage) {
            return 'image';
        } else if (['doc', 'docx'].includes(ext)) {
            return 'description';
        } else if (['xls', 'xlsx'].includes(ext)) {
            return 'inventory';
        }
        return 'insert_drive_file'; // その他のファイル
    }
  },

  methods: {
    /**
     * PDFプレビューをCanvasにレンダリングする
     */
    async renderPdfPreview() {
        // PDFでなければ処理しない
        if (!this.isPDF || !this.attachedFileUrl || !this.$refs.pdfWrapper) {
            return;
        }

        this.isPDFRendering = true;
        this.imageLoadError = false; 

        try {
            const wrapper = this.$refs.pdfWrapper;

            // 以前のCanvasをすべて削除
            while (wrapper.firstChild) {
                wrapper.removeChild(wrapper.firstChild);
            }

            // 新しいCanvas要素を作成
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-preview-canvas';
            wrapper.appendChild(canvas);

            const ctx = canvas.getContext('2d');

            const pdf = await pdfjsLib.getDocument(this.attachedFileUrl).promise;
            const page = await pdf.getPage(1); // 1ページ目のみを取得

            // サムネイル用のサイズ設定: カード幅を基準にスケーリング
            const targetWidth = 300; 
            const viewport1x = page.getViewport({ scale: 1 });
            const scale = targetWidth / viewport1x.width;

            const viewport = page.getViewport({ scale });
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // CSSでコンテナにフィットさせる
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            // 修正: contain に変更し、全ページを枠内に収める
            canvas.style.objectFit = "contain"; 
            canvas.style.backgroundColor = 'white'; // 余白を白にする

            // 描画
            await page.render({
                canvasContext: ctx,
                viewport
            }).promise;

        } catch (e) {
            console.error("PDFプレビュー描画エラー:", this.file.title, e);
            this.imageLoadError = true;
        } finally {
            this.isPDFRendering = false;
        }
    },

    /**
     * 日付文字列を 'YYYY/MM/DD' 形式に整形する
     */
    formatDate(dateString) {
        if (!dateString) return '日付不明';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '/');
        } catch (e) {
            return '日付不明';
        }
    },
    
    /**
     * ファイルダウンロード用の完全なAPI URLを構築
     */
    getFileDownloadUrl(fileId) {
      if (!this.apiBaseUrl) {
        console.error("Error in FileItem.vue: 'apiBaseUrl' prop is missing or undefined.");
        return '#'; 
      }
      const baseUrl = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
      return `${baseUrl}${FILE_ENDPOINT}${fileId}/?download=true`;
    },

    /**
     * 画像のロードに失敗した場合の処理
     */
    handleImageError() {
      this.imageLoadError = true;
      console.error('Failed to load image for file:', this.file.title, 'URL:', this.attachedFileUrl);
    }
  }
};
</script>

<style scoped>
/* --- 既存のスタイル --- */
.file-card {
  border: 2px solid #F1494C;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
  padding: 0;
  margin: 16px 0;
  width: 340px;
  min-width: 260px;
  max-width: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all .15s ease-out; 
}
.file-card:hover {
  transform: translateY(-3px);
}

.file-card-header {
  padding: 18px 18px 7px 18px;
  background: #fff;
  flex-shrink: 0; 
}
.file-card-title {
  display: block;
  color: #F1494C;
  font-size: 18px;
  font-weight: normal;
  margin-bottom: 3px;
  line-height: 1.2;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-card-format {
  color: #555; 
  font-size: 13px;
  margin-top: 0;
  display: block;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-card-format strong {
  font-weight: bold;
}
/* --- 画像エリア --- */
.file-card-image-area {
  background: #ddd;
  height: 140px;
  min-height: 140px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-grow: 1; 
  /* 修正: ここに overflow: hidden を追加して、コンテナを越えるコンテンツをクリップ */
  overflow: hidden; 
}

/* 画像用ラッパー */
.file-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* PDFプレビュー用のラッパー */
.pdf-preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

/* PDFレンダリング中のオーバーレイ */
.rendering-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}
.loading-icon {
    font-size: 3rem;
    color: #F1494C;
    animation: spin 1.5s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 実際の画像に対するスタイル */
.file-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: filter 0.18s;
  z-index: 1;
  position: relative;
}

/* オーバーレイ */
.file-card-image-overlay {
  content: "";
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 20, 0); 
  transition: background 0.17s;
  z-index: 2;
}

.file-card:hover .file-card-image-area .file-card-image-overlay {
  background: rgba(20, 20, 20, 0.32); 
}

/* プレースホルダ（アイコン）コンテナ */
.file-card-image-text {
  color: #232323;
  font-size: 21px;
  font-weight: 500;
  letter-spacing: .01em;
  text-align: center;
  width: 100%;
  pointer-events: none;
}
.icon-display {
    font-size: 4rem; 
    color: #F1494C;
}

/* ダウンロード・削除ボタン下端固定配置 */
.file-card-actions {
  position: absolute;
  margin-top: 74px; 
  right: 12px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  z-index: 9;
  background-color: #f0f0f0;
  padding: 5px;
  border-radius: 10px;
  opacity: 0; 
  pointer-events: none; 
  transition: opacity 0.2s ease-in-out; 
}

/* ホバー時のみ表示するように修正 */
.file-card:hover .file-card-actions,
.file-card-actions:focus-within {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  background: #fff;
  border: 1px solid #ededed;
  border-radius: 6px;
  padding: 0;
  min-width: 13px;
  min-height: 18px;
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

.file-card-download {
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
.file-card-download:hover {
  background: #f8f7f7;
  color: #111;
}

.material-symbols-outlined {
  font-size: 1.2rem;
  line-height: 1;
  vertical-align: middle;
}

@media (max-width: 600px) {
  .file-card {
    width: 100%;
    min-width: 0;
    margin: 14px 0;
  }
  .file-card-header {
    padding: 14px 11px 7px 11px;
  }
  .file-card-image-area {
    height: 110px;
    min-height: 110px;
  }
  .file-card-download {
    background: #fff;
    border: 1px solid #ededed;
    border-radius: 6px;
    padding: 0;
    min-width: 18px;
    min-height: 12px;
    height: 18px;
    width: 12px;
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
  .icon-display {
    font-size: 3rem; 
  }
  .file-card-actions {
    bottom: 7px;
    right: 7px;
    gap: 7px;
  }
  .file-card-download {
    font-size: 12px;
    padding: 6px 11px;
  }
}
</style>