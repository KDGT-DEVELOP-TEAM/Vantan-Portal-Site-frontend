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

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorkerUrl;

const props = defineProps({
  // 描画対象のPDFファイルのURL
  pdfUrl: {
    type: String,
    required: true,
  },
  // サムネイルの最大高さ（親要素の高さ）
  maxHeight: {
    type: Number,
    default: 200, // デフォルト値を設定
  },
});

const pdfCanvas = ref(null);
const loading = ref(true);
const error = ref(false);

/**
 * PDFの1ページ目を読み込み、Canvasにレンダリングする関数
 * @param {string} url - PDFファイルのURL
 */
const renderPdfPage = async (url) => {
  if (!url || !pdfCanvas.value) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = false;
  const canvas = pdfCanvas.value;
  const context = canvas.getContext('2d');
  
  // 以前の描画をクリア
  context.clearRect(0, 0, canvas.width, canvas.height);

  try {
    // 1. PDFドキュメントの読み込み
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    
    // 2. 1ページ目を取得
    const page = await pdf.getPage(1);
    
    // 3. レンダリングサイズを決定
    const viewport = page.getViewport({ scale: 1.0 });

    // 親の高さに合わせてスケールを計算（幅ではなく高さを基準にする）
    const scale = props.maxHeight / viewport.height;
    const scaledViewport = page.getViewport({ scale: scale });

    // Canvasのサイズを設定
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    // 4. キャンバスにページを描画
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };
    await page.render(renderContext).promise;

    loading.value = false;

  } catch (err) {
    console.error("PDFレンダリングエラー:", err);
    error.value = true;
    loading.value = false;
  }
};

// pdfUrl が変更されたときに再レンダリングをトリガー
watch(() => props.pdfUrl, (newUrl) => {
  if (newUrl) {
    renderPdfPage(newUrl);
  }
}, { immediate: true }); 
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