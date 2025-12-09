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
          <template v-if="hasImage">
            <!-- <div v-if="isPDF">
              <div class="pdf-placeholder">
                <span class="material-symbols-outlined pdf-icon">picture_as_pdf</span>
                <div class="pdf-text">{{ schedule.title }}一週間画像</div>
              </div>
            </div> -->
            <div v-if="isPDF">
              <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
            </div>
            <template v-else>
            <a :href="fileUrl" target="_blank" rel="noopener">
              <img
                :src="fileUrl"
                alt="時間割"
                class="preview-img"
                @error="imageError = true"
                v-show="!imageError"
              />
            </a>
          </template>
          <div v-if="imageError && !isPDF" class="pdf-placeholder error">
            <div class="pdf-text">表示できません</div>
          </div>
          </template>
          <div v-else class="pdf-placeholder">
            <div class="pdf-text">時間割ファイルは添付されていません。</div>
          </div>
        </div>
        <div class="detail-actionbar">
          <a
            v-if="hasImage"
            :href="fileUrl"
            target="_blank"
            rel="noopener"
            class="action-btn"
            title="ファイルを新しいタブで表示"
          >
            <span class="material-symbols-outlined">open_in_new</span>
          </a>
          <button
            v-if="hasImage"
            class="action-btn"
            @click="downloadFile"
            title="ダウンロード"
          >
            <span class="material-symbols-outlined">download</span>
          </button>
          <div v-if="userRole === 'admin'" class="action-buttons">
            <button class="delete-btn" @click.stop="handleDelete">
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
const TIMESCHEDULE_ENDPOINT = '/api/timeschedule/';

import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


export default {
  data() {
    return {
      loading: true,
      apiError: null,
      schedule: null,
      imageError: false,
      visible: true,
    };
  },
  async mounted() {
    await this.fetchScheduleDetail();

    this.$nextTick(() => {
      if (this.isPDF && this.fileUrl) {
        this.renderPDF(this.fileUrl);
      }
    });
  },
  watch: {
    fileUrl(newV) {
      if (this.isPDF && newV) {
        this.$nextTick(() => this.renderPDF(newV));
      }
    }
  },
  name: 'TimeScheduleDetail',
  props: {
    scheduleId: {
      type: String,
      required: true,
    },
    userRole: { 
      type: String,
      required: true,
      validator: (value) => ['admin', 'viewer'].includes(value)
    },
    canDelete: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['close', 'delete'],
  computed: {
    hasImage() {
      return (
        this.schedule &&
        this.schedule.image &&
        this.schedule.image.length > 0 &&
        this.schedule.image[0].attached_file_url
      );
    },
    isPDF() {
      if (!this.hasImage) return false;
      // PDF拡張子かどうかで判定
      return /\.pdf($|\?)/i.test(this.fileUrl);
    },
    fileUrl() {
      if (!this.hasImage) return '';

      let urlPath = this.schedule.image[0].attached_file_url;
      
      // 1. 既に完全なURL（http://, https://）が返されている場合はそのまま返す
      if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
        return urlPath;
      }
      
      // 2. 相対パスの場合、ベースURLと結合して完全なURLを生成
      // API_BASE_URLをメディアファイルのベースURLとして利用します
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const path = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
      
      return baseUrl + path;
    },
  },
  methods: {
    async renderPDF(url) {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = this.$refs.pdfCanvas;
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

      } catch (e) {
        console.error("PDF描画エラー:", e);
        this.imageError = true;
      }
    },
    async fetchScheduleDetail() {
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
        const url = `${API_BASE_URL}${TIMESCHEDULE_ENDPOINT}${this.scheduleId}/`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.schedule = response.data;
      } catch (err) {
        console.error("詳細APIエラー:", err.response || err);
        this.apiError = '詳細データの取得中にエラーが発生しました。';
      } finally {
        this.loading = false;
      }
    },
    async downloadFile() {
      if (!this.hasImage) return;
      const token = localStorage.getItem('accessToken');
      const fileUrl = `${API_BASE_URL}${TIMESCHEDULE_ENDPOINT}${this.scheduleId}/?download=true`;

      try {
        const response = await axios.get(fileUrl, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'timeschedule_file';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/i);
          if (match && match[1]) {
            fileName = match[1];
          }
        } else if (this.schedule.image[0].attached_file_url) {
          fileName = this.getFileName(this.schedule.image[0].attached_file_url);
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
      // 子コンポーネントでdeleteイベントemitし、即閉じる
      this.$emit('delete', this.schedule.id);
      this.visible = false;
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.08);
  display: flex;
  align-items: center; /* 中央揃えに修正 */
  justify-content: center;
  min-height: 100vh;
  z-index: 1000;
}

.modal-container.is-preview {
  background: #fff;
  border-radius: 10px;
  margin: 0; /* 上下margin 削除で正確に中央に */
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
  top: 4px;
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
  justify-content: flex-end;
  gap: 6px;
  padding: 10px 20px 18px 20px;
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
.action-btn.danger {
  border: none;
  background: #F1494C;
  color: #fff;
  transition: background 0.18s;
}
.action-btn.danger:hover {
  background: #cc0000;
  color: #fff;
}

/* 状態・エラー／ローディング */
.error-message, .loading-message {
  padding: 18px;
  margin: 18px 0 8px 0;
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
/* --- 4. アクションボタン (管理者用) --- */

.action-buttons .download-btn {
    background: #fff;
    color: #333;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07);
    border: 1px solid #e6e6e6;
    border-radius: 6px;
    cursor: pointer;
    width: 36px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.18s, color 0.15s, box-shadow 0.18s;
}

.action-buttons .download-btn:hover {
    background: #f6f6f6;
    color: #111;
}

.action-buttons .delete-btn {
    background: #F1494C;
    color: #fff;
    border: none;
    border-radius: 6px;
    width: 36px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 0;
    transition: background 0.18s;
}

.action-buttons .delete-btn:hover {
    background: white;
    color: #F1494C;
    border: 2px solid #F1494C;
}

.action-buttons .material-symbols-outlined {
    font-size: 1.25rem;
    margin-right: 0;
}

.material-symbols-outlined {
    font-size: 1.15rem;
    vertical-align: middle;
}

.pdf-canvas {
  max-width: 100%;
  width: 100%;
  height: auto;
  max-height: 420px;
  display: block;
  margin: 0 auto;
  object-fit: contain;
  box-sizing: border-box;
}

@media (max-width: 680px) {
  .modal-container.is-preview {
    max-width: 100vw;
    margin-top: 0px;
    margin-bottom: 0px;
    border-radius: 0;
    min-height: 100vh;
  }
  .img-area {
    min-height: 88px;
    height: 34vw;
    margin: 16px 3vw 12px 3vw;
    width: 94vw;
    border-radius: 0.24rem;
  }
  .detail-actionbar {
    padding: 7px 7vw 14px 7vw;
    gap: 4px;
  }
  /* 親の中央揃え維持 */
  .modal-overlay {
    align-items: center !important;
  }
}
</style>