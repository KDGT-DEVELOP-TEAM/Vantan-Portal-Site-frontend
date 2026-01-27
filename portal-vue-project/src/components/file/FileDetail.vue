<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container is-preview" role="dialog" aria-modal="true">
      <button
        type="button"
        class="close-button"
        @click="$emit('close')"
        :aria-label="$t('common.close')"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <div v-if="loading" class="loading-message">
        {{ $t('fileDetail.loading') }}
      </div>

      <div v-else-if="apiError" class="error-message">
        {{ $t('fileDetail.fetchFailed', { detail: apiError }) }}
      </div>

      <div v-else class="detail-image-container">
        <div class="img-area">
          <!-- 添付あり -->
          <template v-if="hasFile">
            <!-- PDF -->
            <div v-if="isPDF">
              <a :href="fileUrl" target="_blank" rel="noopener noreferrer">
                <div
                  ref="pdfWrapper"
                  class="pdf-canvas"
                  :aria-label="$t('fileDetail.pdfPreviewAria')"
                ></div>
              </a>

              <!-- pdf.js の描画が失敗した場合のフォールバック -->
              <div v-if="pdfPreviewBlocked" class="pdf-placeholder">
                <span class="material-symbols-outlined pdf-icon">picture_as_pdf</span>
                <div class="pdf-text">{{ $t('fileDetail.pdfPreviewUnavailable') }}</div>
              </div>
            </div>

            <!-- 画像 / その他 -->
            <template v-else>
              <a :href="fileUrl" target="_blank" rel="noopener noreferrer">
                <img
                  v-if="isImage"
                  :src="fileUrl"
                  :alt="$t('fileDetail.previewAlt', { title: fileDetail?.title || '' })"
                  class="preview-img"
                  @error="imageError = true"
                  v-show="!imageError"
                />
                <div v-else class="pdf-placeholder">
                  <span class="material-symbols-outlined pdf-icon">description</span>
                  <div class="pdf-text">{{ fileDetail?.title }}</div>
                </div>
              </a>

              <div v-if="imageError && isImage" class="pdf-placeholder error">
                <div class="pdf-text">{{ $t('fileDetail.imageLoadFailed') }}</div>
              </div>
            </template>
          </template>

          <!-- 添付なし -->
          <div v-else class="pdf-placeholder">
            <div class="pdf-text">{{ $t('fileDetail.noAttachment') }}</div>
          </div>
        </div>

        <div class="detail-actionbar">
          <div class="detail-titles">
            <div class="file-title">
              {{ fileDetail?.title }}

              <div class="file-info-text">
                {{ $t('fileDetail.fileType') }}: {{ fileExtensionLabel }}
                &nbsp;|&nbsp;
                {{ $t('fileDetail.createdAt') }}: {{ formatDate(fileDetail?.created_at) }}
              </div>
            </div>
          </div>

          <div class="action-buttons-group">
            <a
              v-if="hasFile"
              :href="fileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="action-btn"
              :title="$t('fileDetail.openInNewTab')"
            >
              <span class="material-symbols-outlined">open_in_new</span>
            </a>

            <button
              v-if="hasFile"
              type="button"
              class="action-btn"
              @click="downloadFile"
              :title="$t('fileDetail.download')"
            >
              <span class="material-symbols-outlined">download</span>
            </button>

            <button
              v-if="hasPermission('user_manage')"
              type="button"
              class="action-btn delete-btn"
              @click.stop="handleDelete"
              :title="$t('fileDetail.delete')"
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
  import { API_BASE_URL, FILE_ENDPOINT, getFileUrl } from '@/api/file';

  import * as pdfjsLib from 'pdfjs-dist';
  import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp', '.webp'];

  export default {
    name: 'FileDetail',

    props: {
      fileId: { type: [String, Number], required: true },
      hasPermission: { type: Function, required: true },
      visible: { type: Boolean, required: true },
    },

    emits: ['close', 'delete'],

    data() {
      return {
        loading: false,
        apiError: null,
        fileDetail: null,
        imageError: false,

        // PDFプレビュー状態
        pdfPreviewBlocked: false, // 認証/CORS/401などで pdfjs が落ちた場合のフォールバック表示
        _pdfRenderSeq: 0, // 競合回避
      };
    },

    computed: {
      hasFile() {
        return !!this.fileDetail?.attached_file;
      },

      /**
       * 添付ファイルURL（相対パスなら絶対URL化）
       * - API_BASE_URL と安全に結合したいので getFileUrl を利用
       */
      fileUrl() {
        if (!this.hasFile) return '';
        return getFileUrl(this.fileDetail.attached_file);
      },

      fileExtension() {
        if (!this.fileUrl) return '';
        const clean = String(this.fileUrl).split('?')[0];
        const idx = clean.lastIndexOf('.');
        if (idx === -1) return '';
        return clean.substring(idx).toLowerCase();
      },

      fileExtensionLabel() {
        const ext = this.fileExtension ? this.fileExtension.replace('.', '') : '';
        return (ext || this.$t('fileDetail.unknown')).toUpperCase();
      },

      isPDF() {
        return this.fileExtension === '.pdf';
      },

      isImage() {
        return IMAGE_EXTENSIONS.includes(this.fileExtension);
      },
    },

    watch: {
      /**
       * 「開くたびに取得」仕様
       * - visible: true になったら取得
       * - ついでに fileId 切替にも対応
       */
      visible: {
        immediate: true,
        handler(v) {
          if (v) this.init();
        },
      },

      fileId: {
        immediate: true,
        handler() {
          // 表示中にIDが変わっても安全に再取得
          if (this.visible) this.init();
        },
      },

      /**
       * PDF描画は fileUrl が確定してから
       */
      fileUrl() {
        this.tryRenderPDF();
      },
    },

    methods: {
      async init() {
        // 初期化
        this.loading = true;
        this.apiError = null;
        this.fileDetail = null;
        this.imageError = false;
        this.pdfPreviewBlocked = false;
        this._pdfRenderSeq++; // 進めて旧描画を無効化

        try {
          await this.fetchFileDetail();
        } finally {
          this.loading = false;
        }

        // 取得後、PDFならプレビューを試す

        console.log('fileUrl:', this.fileUrl);
        this.tryRenderPDF();
      },

      async fetchFileDetail() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // 認証が切れてる/未ログイン想定
          this.apiError = this.$t('auth.tokenNotFound');
          return;
        }

        try {
          const url = this.buildDetailUrl(this.fileId);
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.fileDetail = res.data;
        } catch (err) {
          const status = err?.response?.status;
          if (status === 401) {
            this.apiError = this.$t('auth.sessionExpired');
          } else {
            this.apiError =
              err?.response?.data?.detail ||
              err?.message ||
              this.$t('common.unexpectedError');
          }
        }
      },

      buildDetailUrl(id) {
        // base: 末尾 / を除去
        const base = String(API_BASE_URL || '').replace(/\/$/, '');

        // endpoint: 先頭/末尾の / を正規化
        const raw = String(FILE_ENDPOINT || '');
        const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
        const endpoint = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;

        return `${base}${endpoint}${id}/`;
      },

      buildDownloadUrl(id) {
        const base = String(API_BASE_URL || '').replace(/\/$/, '');
        const raw = String(FILE_ENDPOINT || '');
        const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
        const endpoint = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
        return `${base}${endpoint}${id}/?download=true`;
      },

      /**
       *  PDFバリデーション + 描画試行
       * - visible でない時は描画しない
       * - ref がない時は描画しない
       * - URLがない/非PDFなら描画しない
       */
      tryRenderPDF() {
        if (!this.visible) return;
        if (!this.isPDF) return;
        if (!this.fileUrl) return;

        this.$nextTick(() => {
          // DOMが確実に存在するタイミングでのみ描画
          if (!this.$refs.pdfWrapper) return;
          this.renderPDF(this.fileUrl);
        });
      },

      /**
       *  pdf.js 認証で落ちる問題への対応方針
       * - まずは通常URLで描画を試す
       * - 失敗したら「プレビュー不可」に落として、リンク/ダウンロード導線は残す
       * - 追加対応（Authorization付き描画）はコメントに残す
       */
      async renderPDF(url) {
        const seq = ++this._pdfRenderSeq;

        // ref ガード
        const wrapper = this.$refs.pdfWrapper;
        if (!wrapper) return;

        // 既存canvas削除
        while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-canvas';
        wrapper.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.pdfPreviewBlocked = true;
          return;
        }

        try {
          // 途中で不可視化されたら中断
          if (!this.visible) return;

          // NOTE:
          // 認可が必要な配信だとここで 401/CORS になりやすい
          // その場合は、下記のように httpHeaders を渡す実装に拡張可能：
          // const token = localStorage.getItem('accessToken');
          // const loadingTask = pdfjsLib.getDocument({ url, httpHeaders: { Authorization: `Bearer ${token}` } });
          const loadingTask = pdfjsLib.getDocument(url);
          const pdf = await loadingTask.promise;

          if (seq !== this._pdfRenderSeq) return;

          const page = await pdf.getPage(1);
          if (seq !== this._pdfRenderSeq) return;

          const viewport = page.getViewport({ scale: 1.6 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';

          // 念のためクリア
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const renderTask = page.render({ canvasContext: ctx, viewport });
          await renderTask.promise;

          // 成功したら blocked を解除
          this.pdfPreviewBlocked = false;
        } catch (e) {
          // 認証/CORS/URL不正など、納品事故を避けるためフォールバック
          console.warn('PDF preview failed (fallback to placeholder):', e);
          this.pdfPreviewBlocked = true;
        }
      },

      formatDate(dateString) {
        if (!dateString) return this.$t('fileDetail.unknownDate');
        try {
          const d = new Date(dateString);
          return d.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        } catch {
          return this.$t('fileDetail.unknownDate');
        }
      },

      async downloadFile() {
        if (!this.hasFile) return;

        const token = localStorage.getItem('accessToken');
        if (!token) {
          window.alert(this.$t('auth.tokenNotFound'));
          return;
        }

        const url = this.buildDownloadUrl(this.fileId);

        try {
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });

          // ファイル名推定
          const cd = res.headers?.['content-disposition'];
          let fileName = 'file_download';

          if (cd) {
            // filename="..." を優先
            const m = cd.match(/filename="(.+?)"/i);
            if (m?.[1]) fileName = decodeURI(m[1]);
          } else if (this.fileDetail?.attached_file) {
            fileName = this.getFileName(this.fileDetail.attached_file);
          }

          const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
          console.warn('Download failed:', e?.response || e);
          window.alert(this.$t('fileDetail.downloadFailed'));
        }
      },

      getFileName(pathOrUrl) {
        if (!pathOrUrl) return 'file';
        try {
          const s = String(pathOrUrl);
          const clean = s.split('?')[0];
          return clean.split('/').pop() || 'file';
        } catch {
          return 'file';
        }
      },

      handleDelete() {
        const title = this.fileDetail?.title || String(this.fileId);
        const ok = window.confirm(this.$t('fileDetail.deleteConfirm', { title }));
        if (!ok) return;

        this.$emit('delete', this.fileId);
      },
    },
  };
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    z-index: 1000;
  }

  .modal-container.is-preview {
    background: #fff;
    border-radius: 10px;
    width: 96vw;
    max-width: 980px;
    box-shadow: 0 6px 24px 0 rgba(80, 80, 80, 0.14);
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
    display: block;
    margin: 0 auto;
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
    position: absolute;
    inset: 0;
    background: rgba(216, 216, 216, 0.9);
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
    justify-content: space-between;
    gap: 6px;
    padding: 10px 20px 18px 20px;
  }

  .detail-titles {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
  }

  .file-title {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    color: #f1494c;
    text-align: left;
    letter-spacing: 0.04em;
  }

  .file-info-text {
    font-size: 0.95rem;
    color: #555;
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.09);
    transition: background 0.16s, color 0.13s;
  }

  .action-btn:hover {
    background: #f8f7f7;
    color: #111;
  }

  .action-btn.delete-btn {
    background: #f1494c;
    color: #fff;
    border: none;
  }

  .action-btn.delete-btn:hover {
    background: white;
    color: #f1494c;
    box-shadow: 0 0 0 1px #f1494c inset;
  }

  .error-message,
  .loading-message {
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

  /* PDF canvas */
  ::v-deep(.pdf-canvas) {
    width: 100% !important;
    height: auto !important;
    max-height: 530px !important;
    display: block;
    margin: 0 auto;
    object-fit: contain;
    box-sizing: border-box;
  }

  @media (max-width: 580px) {
    .modal-container.is-preview {
      max-width: 90vw;
      border-radius: 5px;
      min-height: 70vh;
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

    ::v-deep(.pdf-canvas) {
      max-height: 360px !important;
    }

    .preview-img {
      max-height: 365px !important;
    }
  }
</style>