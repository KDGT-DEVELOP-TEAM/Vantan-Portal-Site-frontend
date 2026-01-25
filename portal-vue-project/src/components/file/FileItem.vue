<template>
  <div
    class="file-card"
    role="button"
    tabindex="0"
    @click="emitViewDetail"
    @keydown.enter.prevent="emitViewDetail"
    @keydown.space.prevent="emitViewDetail"
  >
    <div class="file-card-header">
      <span class="file-card-title">{{ file.title }}</span>
      <span class="file-card-format">
        {{ $t('fileItem.fileType') }}: {{ fileExtensionLabel }} | 
        {{ $t('fileItem.publishedAt') }}: {{ formatDate(file.created_at) }}
      </span>
    </div>
    
    <div class="file-card-image-area">
      <template v-if="attachedFileUrl && isPDF && !pdfRenderError">
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
            :alt="$t('fileItem.previewAlt', { title: file.title })" 
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
        :href="downloadUrl" 
        target="_blank"
        rel="noopener noreferrer"
        class="action-btn file-card-download"
        @click.stop
        :title="$t('fileItem.download')"
      >
        <span class="material-symbols-outlined">download</span>
      </a>
      
      <button 
        v-if="hasPermission('user_manage')"
        type="button"
        class="action-btn delete-btn" 
        @click.stop="$emit('delete', file.id)"
        :title="$t('fileItem.delete')"
      >
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
</template>

<script>
  import * as pdfjsLib from 'pdfjs-dist';
  import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'; 
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  import { FILE_ENDPOINT, getFileUrl, API_BASE_URL } from '@/api/file';

  export default {
    name: 'FileItem',
    props: {
      file: { type: Object, required: true },
      hasPermission: { type: Function, required: true },
    },
    emits: ['view-detail', 'delete'],
    data() {
        return {
            imageLoadError: false,
            pdfRenderError: false,
            isPDFRendering: false,
            _renderSeq: 0, 
        };
    },
    computed: {
      fileExtension() {
        const urlPath = this.file?.attached_file;
        if (!urlPath) return null;
        const path = urlPath.split('/').pop() || '';
        const parts = path.split('.');
        if (parts.length <= 1) return null;
        const cleanExt = (parts.pop() || '').split('?')[0];
        return cleanExt.toLowerCase() || null;
      },
      fileExtensionLabel() {
        return (this.fileExtension || this.$t('fileItem.unknown')).toUpperCase();
      },
      isPDF() {
        return this.fileExtension === 'pdf';
      },
      isImage() {
        const ext = this.fileExtension;
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(ext);
      },
      attachedFileUrl() {
        return getFileUrl(this.file?.attached_file);
      },
      fileIcon() {
        const ext = this.fileExtension;
        if (ext === 'pdf') return 'picture_as_pdf';
        if (this.isImage) return 'image';
        if (['doc', 'docx'].includes(ext)) return 'description';
        if (['xls', 'xlsx'].includes(ext)) return 'inventory';
        return 'insert_drive_file';
      },
      downloadUrl() {
        const id = this.file?.id;
        if (!id) return '#';
        const base = (API_BASE_URL || '').replace(/\/$/, '');
        const endpointRaw = FILE_ENDPOINT || '';
        const endpoint = endpointRaw.startsWith('/') ? endpointRaw : `/${endpointRaw}`;
        const normalizedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
        return `${base}${normalizedEndpoint}${id}/?download=true`;
      },
    },
    mounted() {
      this.tryRenderPdfPreview();
    },
    watch: {
      attachedFileUrl() {
        this.tryRenderPdfPreview();
      },
      file: {
        deep: true,
        handler() {
          this.imageLoadError = false;
          this.pdfRenderError = false;
          this.tryRenderPdfPreview();
        },
      },
    },
    methods: {
      emitViewDetail() {
        const id = this.file?.id;
        if (!id) return;
        this.$emit('view-detail', id);
      },
      tryRenderPdfPreview() {
        if (this.isPDF && this.attachedFileUrl) {
          this.$nextTick(() => this.renderPdfPreview());
        }
      },
      async renderPdfPreview() {
        if (!this.isPDF || !this.attachedFileUrl || !this.$refs.pdfWrapper) return;
        const seq = ++this._renderSeq;
        this.isPDFRendering = true;

        try {
          const wrapper = this.$refs.pdfWrapper;
          while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);

          const canvas = document.createElement('canvas');
          wrapper.appendChild(canvas);
          const ctx = canvas.getContext('2d');

          const pdf = await pdfjsLib.getDocument(this.attachedFileUrl).promise;
          if (seq !== this._renderSeq) return;
          const page = await pdf.getPage(1);

          // --- 修正：高さ(140px)を基準にスケールを決める ---
          const viewport1x = page.getViewport({ scale: 1 });
          const containerHeight = 140; 
          
          // 高さを140pxにするための倍率を計算
          const scale = containerHeight / viewport1x.height;
          
          // 描画用のviewport（くっきりさせるために少し倍率を上げる）
          const viewport = page.getViewport({ scale: scale * 2 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Canvasの表示サイズを制御
          Object.assign(canvas.style, {
            height: '100%',     /* 高さは親（140px）に合わせる */
            width: 'auto',      /* 横幅はアスペクト比を維持して自動 */
            display: 'block',
            backgroundColor: 'white',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)' // PDFっぽく少し影をつけると綺麗です
          });

          await page.render({ canvasContext: ctx, viewport }).promise;
        } catch (e) {
          console.warn('PDF render failed:', e);
        } finally {
          if (seq === this._renderSeq) this.isPDFRendering = false;
        }
      },
      formatDate(dateString) {
        if (!dateString) return this.$t('fileItem.unknownDate');
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('ja-JP', {
            year: 'numeric', month: '2-digit', day: '2-digit'
          });
        } catch {
          return this.$t('fileItem.unknownDate');
        }
      },
      handleImageError() {
        this.imageLoadError = true;
      }
    }
  };
</script>

<style scoped>
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
    width: 100%;  /* 30%から100%に戻す */
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center; /* 左右中央 */
    align-items: center;     /* 上下中央 */
    z-index: 1;
    overflow: hidden;
    background: #ddd; /* グレーの背景 */
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