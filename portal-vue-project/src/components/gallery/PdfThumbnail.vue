<template>
  <div class="pdf-thumbnail-wrapper">
    <canvas ref="pdfCanvas" :key="pdfUrl" class="pdf-canvas"></canvas>
    
    <div v-if="loading" class="pdf-loading-overlay">
      <div class="loading-spinner"></div>
      PDFを読み込み中...
    </div>
    <div v-if="error" class="pdf-error-overlay">
      <span class="material-symbols-outlined">error</span>
      描画失敗
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
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

const renderPdfPage = (url) => {
  if (!url) {
    loading.value = false;
    return;
  }
  
  const canvas = pdfCanvas.value;
  if (!canvas) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = false;

  const getPdfDataPromise = (pdfUrl) => {
    if (pdfUrl.startsWith('blob:')) {
      // Blob URLの場合は、axiosを使わずに直接fetchする
      return fetch(pdfUrl).then(res => res.arrayBuffer());
    } else {
      // 通常のURLの場合は、既存のaxiosインスタンス(CORS対策など)を使う
      return fetchFile(pdfUrl).then(res => res.data);
    }
  };
  
  getPdfDataPromise(url)
    .then(pdfData => {
      return pdfjsLib.getDocument({ data: pdfData }).promise;
    })
    .then(pdf => pdf.getPage(1))
    .then(page => {
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = props.maxHeight / viewport.height;
      const scaledViewport = page.getViewport({ scale });

      const context = canvas.getContext('2d');
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      return page.render(renderContext).promise;
    })
    .catch(err => {
      console.error("PDFレンダリングエラー:", err);
      error.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(() => props.pdfUrl, (newUrl) => {
  if (newUrl) {
    renderPdfPage(newUrl);
  }
});

onMounted(() => {
  if (props.pdfUrl) {
    renderPdfPage(props.pdfUrl);
  }
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

.pdf-loading-overlay, .pdf-error-overlay {
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

/* ローディングスピナー (親コンポーネントのCSSから流用) */
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.material-symbols-outlined {
    font-size: 24px;
    margin-bottom: 8px;
}
</style>