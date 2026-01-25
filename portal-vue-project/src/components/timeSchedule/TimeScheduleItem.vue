<template>
  <div class="time-schedule-item" @click="handleViewDetail">
    <div class="item-header">
      <p class="item-title">{{ item.title }}</p>
    </div>

    <div class="item-image-container">
      <template v-if="fileUrl && !imageLoadError">
        <template v-if="isPDF">
          <div class="pdf-placeholder">
            <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
          </div>
        </template>

        <template v-else>
          <img
            :src="fileUrl"
            :alt="$t('timeschedule.item.imageAlt')"
            class="item-image"
            @error="handleImageError"
          />
        </template>
      </template>

      <div v-else class="no-image-placeholder">
        <p v-if="fileUrl">{{ $t('common.unavailable') }}</p>
        <p v-else>{{ $t('timeschedule.item.noFile') }}</p>
      </div>
    </div>

    <div class="item-footer">
      <p class="item-date">
        {{ $t('timeschedule.item.uploaded') }} {{ formatDate(item.createdAt) }}
      </p>

      <span v-if="item?.grade" class="grade-label">
        {{ item.grade }}{{ $t('timeschedule.item.gradeSuffix') }}
      </span>
      <span v-else>
        {{ $t('timeschedule.item.gradeUnknown') }}
      </span>
    </div>

    <div class="action-buttons-wrapper">
      <button
        v-if="fileUrl"
        class="download-btn action-btn"
        @click.stop="downloadFile"
        :title="$t('timeschedule.item.downloadTitle')"
        type="button"
      >
        <span class="material-symbols-outlined">download</span>
      </button>

      <button
        v-if="canDelete"
        class="delete-btn action-btn"
        @click.stop="$emit('delete', item.id)"
        :title="$t('common.delete')"
        type="button"
      >
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
</template>

<script>
  import * as pdfjsLib from 'pdfjs-dist';
  import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
  import { downloadTimeScheduleFileApi } from '@/api/timetable';

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  export default {
    name: 'TimeScheduleItem',
    emits: ['view-detail', 'delete'],
    props: {
      item: {
        type: Object,
        required: true,
      },
      canDelete: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        imageLoadError: false,
      };
    },
    computed: {
      // item.images / item.image の揺れを吸収
      fileUrl() {
        const images = this.item?.images || this.item?.image || [];
        if (Array.isArray(images) && images.length > 0) {
          return images[0]?.attached_file_url || null;
        }
        return null;
      },
      isPDF() {
        if (!this.fileUrl) return false;
        return /\.pdf($|\?)/i.test(this.fileUrl);
      },
    },
    watch: {
      fileUrl: {
        immediate: true,
        async handler(newVal) {
          this.imageLoadError = false;
          if (this.isPDF && newVal) {
            await this.$nextTick();
            this.renderPDF(newVal);
          }
        },
      },
    },
    methods: {
      handleViewDetail() {
        this.$emit('view-detail', this.item.id);
      },

      formatDate(isoString) {
        if (!isoString) return this.$t('common.unknownDate');
        try {
          const date = new Date(isoString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}/${month}/${day}`;
        } catch {
          return this.$t('common.unknownDate');
        }
      },

      handleImageError() {
        this.imageLoadError = true;
      },

      async renderPDF(url) {
        try {
          const canvas = this.$refs.pdfCanvas;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const pdf = await pdfjsLib.getDocument(url).promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // 再描画のゴミ除去
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;
        } catch (err) {
          console.error('PDF描画エラー:', err);
          this.imageLoadError = true;
        }
      },

      async downloadFile() {
        if (!this.item?.id) return;

        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('TOKEN_NOT_FOUND');

          const response = await downloadTimeScheduleFileApi(this.item.id, token);

          const contentDisposition = response.headers?.['content-disposition'];
          let fileName = 'timeschedule_file';

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/i);
            if (match?.[1]) fileName = match[1];
          } else if (this.fileUrl) {
            fileName = this.fileUrl.split('/').pop().split('?')[0] || fileName;
          }

          const blob = new Blob([response.data]);
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          link.click();

          window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.error('DLエラー:', err);
          alert(this.$t('common.downloadFailed'));
        }
      },
    },
  };
</script>

<style scoped>
  .item-image-container canvas {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  .time-schedule-item {
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: box-shadow 0.2s;
    margin-bottom: 30px;
    height: 400px;
  }

  .time-schedule-item:hover {
    box-shadow: 0 0 0 2px #f1494c, 0 4px 10px rgba(0, 0, 0, 0.06);
  }

  .item-header {
    background: #f1494c;
    color: #fff;
    padding: 10px 12px 8px 12px;
    flex-shrink: 0;
  }

  .item-title {
    margin: 0;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    color: #fff;
    text-align: left;
    letter-spacing: 0.04em;
  }

  .item-image-container {
    background: #dadada;
    min-height: 155px;
    height: 155px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    overflow: hidden;
  }

  .time-schedule-item:hover .item-image-container {
    filter: brightness(0.6);
    transition: filter 0.2s;
  }

  .item-image {
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
  }

  .pdf-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f7f7;
    height: 100%;
    width: 100%;
  }

  .no-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    font-weight: 500;
    font-size: 1.02rem;
  }

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    min-height: 36px;
    font-size: 0.82rem;
  }

  .item-date {
    margin: 0;
    font-size: 0.76rem;
    color: #888;
  }

  .grade-label {
    background: #007bff;
    color: #fff;
    border-radius: 3px;
    font-size: 0.78rem;
    padding: 1.5px 8px;
    font-weight: bold;
    margin-left: 8px;
  }

  .action-buttons-wrapper {
    position: absolute;
    top: 44px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 9;
    background-color: #f0f0f0;
    padding: 5px;
    border-radius: 10px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  }

  .time-schedule-item:hover .action-buttons-wrapper {
    opacity: 1;
    pointer-events: auto;
  }

  .action-btn {
    border-radius: 6px;
    width: 36px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: background 0.18s, color 0.15s, box-shadow 0.18s;
  }

  .download-btn {
    background: #fff;
    color: #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
    border: 1px solid #e6e6e6;
  }

  .download-btn:hover {
    background: #f6f6f6;
    color: #111;
  }

  .delete-btn {
    background: #f1494c;
    color: #fff;
    border: none;
  }

  .delete-btn:hover {
    background: white;
    color: #f1494c;
    border: 2px solid #f1494c;
  }

  .material-symbols-outlined {
    font-size: 1.25rem;
    vertical-align: middle;
  }

  .pdf-canvas {
    max-height: 100%;
    height: 420px;
    width: auto;
    max-width: 320px;
    display: block;
    margin: 0 auto;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    .item-header {
      padding: 7px 8px 6px 9px;
    }

    .item-title {
      font-size: 0.95rem;
    }

    .item-image-container {
      min-height: 130px;
      height: 130px;
    }

    .item-footer {
      padding: 7px 9px 7px 11px;
      font-size: 0.75rem;
    }

    .action-buttons-wrapper {
      right: 6px;
      gap: 4px;
    }

    .download-btn,
    .delete-btn {
      width: 33px;
      height: 29px;
    }
  }
</style>