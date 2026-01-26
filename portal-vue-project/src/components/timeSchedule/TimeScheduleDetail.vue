<template>
  <div
    v-if="visible"
    class="modal-overlay"
    @click.self="emit('close')"
  >
    <div class="modal-container is-preview">
      <button class="close-button" @click="emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>

      <div v-if="loading" class="loading-message">
        {{ $t('timeschedule.detail.loading') }}
      </div>

      <div v-else-if="apiError" class="error-message">
        {{ $t('timeschedule.detail.fetchFailed') }}: {{ apiError }}
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
                  :src="fileUrl"
                  :alt="$t('timeschedule.detail.alt')"
                  class="preview-img"
                  @error="imageError = true"
                  v-show="!imageError"
                />
              </a>
            </template>

            <div v-if="imageError && !isPDF" class="pdf-placeholder error">
              <div class="pdf-text">{{ $t('common.unavailable') }}</div>
            </div>
          </template>

          <div v-else class="pdf-placeholder">
            <div class="pdf-text">{{ $t('timeschedule.detail.noFile') }}</div>
          </div>
        </div>

        <div class="detail-actionbar">
          <div class="detail-titles">
            <h3 class="schedule-title">
              {{ scheduleTitle }}
            </h3>

            <div class="grade-label">
              <span v-if="scheduleGrade !== null">
                {{ $t('timeschedule.detail.gradeLabel', { grade: scheduleGrade }) }}
              </span>
              <span v-else>
                {{ $t('timeschedule.detail.unknownGrade') }}
              </span>
            </div>
          </div>

          <a
            v-if="hasFile"
            :href="fileUrl"
            target="_blank"
            rel="noopener"
            class="action-btn"
            :title="$t('timeschedule.detail.openInNewTab')"
          >
            <span class="material-symbols-outlined">open_in_new</span>
          </a>

          <button
            v-if="hasFile"
            class="action-btn"
            @click="downloadFile"
            :title="$t('common.download')"
            type="button"
          >
            <span class="material-symbols-outlined">download</span>
          </button>

          <!-- List側の修正に合わせて canDelete のみで制御 -->
          <div v-if="canDelete" class="action-buttons">
            <button class="delete-btn" type="button" @click.stop="handleDelete">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import {
    fetchTimeScheduleDetailApi,
    downloadTimeScheduleFileApi,
  } from '@/api/timetable';

  import * as pdfjsLib from 'pdfjs-dist';
  import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  export default {
    name: 'TimeScheduleDetail',
    props: {
      scheduleId: {
        type: String,
        required: true,
      },
      // List側で削除可否を確定して渡す
      canDelete: {
        type: Boolean,
        default: false,
      },
      // visible を親制御にしたい場合に備えて残す（現状は内部で true）
      // visible: { type: Boolean, default: true },
    },
    emits: ['close', 'delete'],
    data() {
      return {
        loading: true,
        apiError: null,
        schedule: null,
        imageError: false,
        visible: true,
      };
    },
    computed: {
      scheduleTitle() {
        return this.schedule?.title || this.$t('common.unknownTitle');
      },
      scheduleGrade() {
        const g = this.schedule?.grade;
        return typeof g === 'number' ? g : null;
      },
      hasFile() {
        const url = this.schedule?.image?.[0]?.attached_file_url;
        return !!url;
      },
      fileUrl() {
        return this.hasFile ? this.schedule.image[0].attached_file_url : '';
      },
      isPDF() {
        if (!this.hasFile) return false;
        return /\.pdf($|\?)/i.test(this.fileUrl);
      },
    },
    mounted() {
      this.loadDetail();
    },
    methods: {
      async loadDetail() {
        await this.fetchScheduleDetail();

        this.$nextTick(() => {
          if (this.isPDF && this.fileUrl) {
            this.renderPDF(this.fileUrl);
          }
        });
      },

      ensureToken() {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('TOKEN_NOT_FOUND');
        return token;
      },

      async renderPDF(url) {
        try {
          const wrapper = this.$refs.pdfWrapper;
          if (!wrapper) return;

          // 古いCanvasを全削除
          while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
          }

          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-canvas';
          wrapper.appendChild(canvas);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            this.imageError = true;
            return;
          }

          const pdf = await pdfjsLib.getDocument(url).promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 1.6 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          canvas.style.width = '100%';
          canvas.style.height = 'auto';

          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;
        } catch (e) {
          console.error('PDF描画エラー:', e);
          this.imageError = true;
        }
      },

      async fetchScheduleDetail() {
        this.loading = true;
        this.apiError = null;
        this.imageError = false;

        try {
          const token = this.ensureToken();
          const res = await fetchTimeScheduleDetailApi(this.scheduleId, token);
          this.schedule = res.data;
        } catch (err) {
          console.error('詳細APIエラー:', err);
          this.apiError = this.$t('timeschedule.detail.apiError');
        } finally {
          this.loading = false;
        }
      },

      async downloadFile() {
        if (!this.hasFile) return;

        try {
          const token = this.ensureToken();

          const response = await downloadTimeScheduleFileApi(this.scheduleId, token);

          const contentDisposition = response?.headers?.['content-disposition'];
          let fileName = 'timeschedule_file';

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/i);
            if (match?.[1]) fileName = match[1];
          } else {
            fileName = this.getFileName(this.fileUrl);
          }

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error('DLエラー:', err);
          alert(this.$t('timeschedule.detail.downloadFailed'));
        }
      },

      getFileName(url) {
        if (!url) return this.$t('common.unknownFile');
        try {
          return url.split('/').pop().split('?')[0] || this.$t('common.file');
        } catch {
          return this.$t('common.file');
        }
      },

      handleDelete() {
        // List側は scheduleId で削除できるので、それを返す（schedule nullでも落ちない）
        this.$emit('delete', this.scheduleId);
        this.$emit('close');
      },
    },
  };
</script>

<style scoped>
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
  .close-button:hover { color: #222; }

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
  .pdf-placeholder .pdf-text {
    font-size: 1.04rem;
    font-weight: 550;
    color: #111;
    letter-spacing: 0.04em;
  }
  .pdf-placeholder.error .pdf-text { color: #d22; }

  .detail-actionbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px 18px 20px;
    gap: 6px;
    margin-top: 10px;
  }

  .detail-titles {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    flex: 1;
  }

  .schedule-title {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    color: #F1494C;
    text-align: left;
    letter-spacing: 0.04em;
  }

  .grade-label {
    background: #007bff;
    color: #fff;
    border-radius: 3px;
    font-size: 0.78rem;
    padding: 1.5px 8px;
    font-weight: bold;
    margin-left: 8px;
    display: inline-block;
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

  /* 状態 */
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

  /* 管理者ボタン */
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
    transition: background 0.18s;
  }
  .action-buttons .delete-btn:hover {
    background: white;
    color: #F1494C;
    border: 2px solid #F1494C;
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
    ::v-deep(.pdf-canvas) {
      max-height: 330px !important;
    }
  }
</style>