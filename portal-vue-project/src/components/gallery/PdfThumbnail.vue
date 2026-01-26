<template>
  <div class="pdf-thumbnail-wrapper">
    <canvas ref="pdfCanvas" :key="pdfUrl" class="pdf-canvas"></canvas>

    <div v-if="loading" class="pdf-loading-overlay">
      <div class="loading-spinner"></div>
      {{ $t('common.loadingPdf') }}
    </div>

    <div v-if="error" class="pdf-error-overlay">
      <span class="material-symbols-outlined">error</span>
      {{ $t('common.renderFailed') }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import PdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { fetchFile } from '@/api/gallery';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorkerUrl;

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
  },
  maxHeight: {
    type: Number,
    default: 200,
  },
});

const pdfCanvas = ref(null);
const loading = ref(true);
const error = ref(false);

let renderTask = null;
let isUnmounted = false;

const safeCancelRenderTask = () => {
  if (!renderTask) return;
  try {
    renderTask.cancel();
  } catch (_) {
    // cancelタイミングによっては例外になり得るが無視でOK
  } finally {
    renderTask = null;
  }
};

const getPdfDataPromise = (pdfUrl) => {
  if (pdfUrl.startsWith('blob:')) {
    // Blob URLの場合は fetch で arrayBuffer
    return fetch(pdfUrl).then((res) => {
      if (!res.ok) throw new Error('Blob fetch failed');
      return res.arrayBuffer();
    });
  }
  // 通常URLの場合は axios 経由（CORS対策など）
  return fetchFile(pdfUrl).then((res) => res.data);
};

const renderPdfPage = async (url) => {
  if (!url) {
    loading.value = false;
    return;
  }

  // canvas が key により差し替わることがあるため nextTick で安定させる
  await nextTick();

  const canvas = pdfCanvas.value;
  if (!canvas || isUnmounted) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = false;

  // 既存タスクがあればキャンセル
  safeCancelRenderTask();

  try {
    const pdfData = await getPdfDataPromise(url);
    if (isUnmounted) return;

    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    if (isUnmounted) return;

    const page = await pdf.getPage(1);
    if (isUnmounted) return;

    const viewport = page.getViewport({ scale: 1.0 });
    const scale = props.maxHeight / viewport.height;
    const scaledViewport = page.getViewport({ scale });

    const context = canvas.getContext('2d');
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    renderTask = page.render({
      canvasContext: context,
      viewport: scaledViewport,
    });

    await renderTask.promise;
  } catch (err) {
    console.error('PDFレンダリングエラー:', err);
    if (!isUnmounted) error.value = true;
  } finally {
    if (!isUnmounted) loading.value = false;
    renderTask = null;
  }
};

watch(
  () => props.pdfUrl,
  (newUrl) => {
    if (newUrl) renderPdfPage(newUrl);
    else loading.value = false;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  isUnmounted = true;
  safeCancelRenderTask();
});
</script>

<style scoped>
.pdf-thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f9fafb;
}

.pdf-canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.pdf-loading-overlay,
.pdf-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-weight: 500;
  z-index: 10;
}

.pdf-error-overlay {
  color: #ef4444;
}

/* ローディングスピナー */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #f15b5b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.material-symbols-outlined {
  font-size: 24px;
  margin-bottom: 8px;
}
</style>
