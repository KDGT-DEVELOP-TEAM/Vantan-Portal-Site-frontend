<template>
    <div class="time-schedule-item" @click="handleViewDetail">
        
        <div class="item-header">
            <p class="item-title">{{ item.title }}</p>
        </div>
        
        <div class="item-image-container">
            <template v-if="imageURL && !imageLoadError">
                <!-- <template v-if="isPDF">
                    <div class="pdf-placeholder">
                        <span class="material-symbols-outlined pdf-icon">picture_as_pdf</span>
                        <p class="pdf-text">PDFファイルを確認</p>
                    </div>
                </template> -->
                <template v-if="isPDF">
                    <div class="pdf-placeholder">
                        <canvas ref="pdfCanvas" class="pdf-canvas" />
                    </div>
                </template>
                <template v-else>
                    <img
                        :src="imageURL"
                        alt="時間割画像"
                        class="item-image"
                        @error="handleImageError"
                    />
                </template>
            </template>
            <div v-else class="no-image-placeholder">
                <p>画像/ファイルなし</p>
            </div>
        </div>

        <div class="item-footer">
             <p class="item-date">アップロード: {{ formatDate(item.createdAt) }}</p>
            <span class="grade-label">{{ item.grade }}年生</span>
        </div>
      
        <div class="action-buttons-wrapper">
            <button
                v-if="imageURL"
                class="download-btn action-btn"
                @click.stop="downloadFile"
                title="画像/ファイルをダウンロード"
            >
                <span class="material-symbols-outlined">download</span>
            </button>
            
            <button v-if="userRole === 'admin'" class="delete-btn action-btn" @click.stop="$emit('delete', item.id)">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    </div>
</template>
  
<script>
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


export default {
    watch: {
        imageURL: {
            immediate: true,
            handler(newVal) {
            if (this.isPDF && newVal) {
                this.$nextTick(() => this.renderPDF(newVal));
            }
            }
        }
    },
    name: 'TimeScheduleItem',
    props: {
        item: {
            type: Object,
            required: true,
            // item の構造: { id: 1, title: 'タイトル', grade: 3, createdAt: '2025/01/01T12:00:00Z', image: [{ attached_file_url: '...' }] } を想定
        },
        userRole: {
            type: String,
            required: true,
            validator: (value) => ['admin', 'viewer'].includes(value)
        }
    },
    data() {
        return {
            // 画像ロードエラーフラグ
            imageLoadError: false,
        };
    },
    emits: ['view-detail', 'delete'],
    computed: {
        // 最初の添付画像のURLを取得する
        imageURL() {
            if (this.item.images && this.item.images.length > 0) {
                return this.item.images[0].attached_file_url || null;
            }
            return null;
        },
        // ファイルがPDFかどうかを判定する (このロジックは変更なしでOK)
        isPDF() {
            const url = this.imageURL;
            if (!url) return false;
            // URLの末尾が.pdfで終わるかどうかで判定
            return url.toLowerCase().endsWith('.pdf');
        }
    },
    methods: {
        handleViewDetail() {
            // 詳細モーダル表示を親に伝える
            this.$emit('view-detail', this.item.id);
        },
        // ★ 簡素化された downloadFile メソッド (構文エラーの原因を解消) ★
        async downloadFile() {
            if (!this.imageURL) return;

            const response = await fetch(this.imageURL);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            const ext = blob.type.includes("pdf") ? ".pdf" : "";
            link.href = url;
            link.download = `${this.item.title}${ext}`;

            link.click();
            window.URL.revokeObjectURL(url);
        },
        // ★ formatDate が正しく定義されるようになりました ★
        formatDate(isoString) {
            if (!isoString) return '日付不明';
            const date = new Date(isoString);
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '/');
        },
        handleImageError() {
            // 画像が壊れていたときは画像/ファイルなしを表示する
            this.imageLoadError = true;
        },
        async renderPDF(url) {
            try {
                const pdf = await pdfjsLib.getDocument(url).promise;
                const page = await pdf.getPage(1); // 1ページ目のみ描画
                const viewport = page.getViewport({ scale: 1.5 }); // 拡大率を調整
                const canvas = this.$refs.pdfCanvas;
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
            } catch (err) {
                console.error("PDF描画エラー:", err);
                this.imageLoadError = true;
            }
        },
    }
}
</script>

<style scoped>
    .item-image-container canvas {
        width: 100%;
        height: auto;
        object-fit: contain;
    }
    /* --- カード全体 (time-schedule-item) --- */
    .time-schedule-item {
        border-radius: 8px;
        background: #fff;
        border: none;
        overflow: hidden;
        box-shadow: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: box-shadow 0.2s;
        margin-bottom: 30px;
        box-shadow: none;
        /* この固定高がモバイルで調整を困難にする可能性がありますが、元の指定を維持します */
        height: 400px; 
    }
    /* ホバーで薄い赤枠・影を出す */
    .time-schedule-item:hover {
        box-shadow: 0 0 0 2px #F1494C, 0 4px 10px rgba(0,0,0,0.06);
    }
    
    /* --- 1. 赤いヘッダー部分 (item-header) --- */
    .item-header {
        background: #F1494C;
        color: #fff;
        padding: 10px 12px 8px 12px;
        flex-shrink: 0;
    }
    
    .item-title {
        margin: 0;
        font-size: 1rem;
        font-weight: normal;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
        color: #fff;
        text-align: left;
        letter-spacing: 0.04em;
    }
    
    /* --- 2. 画像コンテナ部分 (item-image-container) --- */
    .item-image-container {
        background: #dadada;
        /* min-heightとheightを同じ値にすると、画像比率での高さ調整が難しくなりますが、元の指定を維持します */
        min-height: 155px;
        height: 155px; 
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        overflow: hidden;
    }
    
    /* ホバー時に画像コンテナ全体を暗くする */
    .time-schedule-item:hover .item-image-container {
        filter: brightness(0.6);
        transition: filter 0.2s;
    }
    
    .item-image-container a {
        width: 100%;
        height: 100%;
        display: block;
        text-decoration: none;
    }
    
    .item-image {
        object-fit: cover;
        width: 100%;
        height: 100%;
        display: block;
        transition: filter 0.2s;
    }
    
    .pdf-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f7f7f7;
        height: 100%;
        width: 100%;
        color: #222;
        font-weight: 700;
        font-size: 1.1rem;
        letter-spacing: .02em;
        cursor: pointer;
        transition: background 0.16s;
    }
    
    .pdf-placeholder:hover {
        background: #f0f0f0;
    }
    
    .pdf-icon {
        font-size: 2.7rem;
        color: #F1494C;
        margin-bottom: 4px;
    }
    
    .pdf-text {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 500;
        color: #222;
    }
    
    .no-image-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #111;
        background: transparent;
        font-weight: 500;
        font-size: 1.02rem;
        height: 100%;
        letter-spacing: 0.04em;
    }
    
    /* --- 3. フッター (item-footer) --- */
    .item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px 8px 14px;
        background: none;
        border-top: none;
        min-height: 36px;
        font-size: 0.82rem;
    }
    
    .item-date {
        margin: 0;
        font-size: 0.76rem;
        color: #888;
        flex-shrink: 1;
    }
    
    .grade-label {
        background: #007bff;
        color: #fff;
        border-radius: 3px;
        font-size: 0.78rem;
        padding: 1.5px 8px;
        font-weight: bold;
        margin-left: 8px;
        vertical-align: middle;
    }
    
    /* --- 4. アクションボタン (ホバー時表示の統合) --- */
    .action-buttons-wrapper {
        position: absolute;
        top: 44px; /* item-header の高さ＋α */
        right: 12px;
        display: flex;
        flex-direction: row;
        gap: 8px;
        z-index: 9;
        background-color: #f0f0f0;
        padding: 5px;
        border-radius: 10px;
        /* ダウンロードボタンの表示制御の根幹 */
        opacity: 0; 
        pointer-events: none; 
        transition: opacity 0.2s ease-in-out; 
    }
    
    /* ★カードにホバーした時にボタンを表示/有効化★ */
    .time-schedule-item:hover .action-buttons-wrapper {
        opacity: 1;
        pointer-events: auto;
    }
    
    /* ボタン共通のベーススタイル */
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
    
    /* ダウンロードボタンのスタイル */
    .download-btn {
        background: #fff;
        color: #333;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        border: 1px solid #e6e6e6;
    }
    .download-btn:hover {
        background: #f6f6f6;
        color: #111;
    }
    
    /* 削除ボタンのスタイル (管理者のみ) */
    .delete-btn {
        background: #F1494C;
        color: #fff;
        border: none;
    }
    .delete-btn:hover {
        background: white;
        color: #F1494C;
        border: 2px solid #F1494C;
    }
    
    .material-symbols-outlined {
        font-size: 1.25rem;
        margin-right: 0;
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
    
    /* メディアクエリ (transform: scale を使わずにサイズを調整) 📱 */
    @media (max-width: 768px) {
        .time-schedule-item {
            margin-bottom: 20px;
            /* height: 400px; をこの中で小さく指定することもできますが、
               今回は他のpaddingやフォントサイズで調整します。 */
        }
        .item-header {
            /* パディングをさらに小さくし、全体の高さを節約 */
            padding: 7px 8px 6px 9px;
        }
        .item-title {
            font-size: 0.95rem;
        }
        .item-image-container {
            /* 画像の高さを減らすことで、カード全体を小さく見せます */
            min-height: 130px;
            height: 130px; 
        }
        .item-footer {
            padding: 7px 9px 7px 11px;
            font-size: 0.75rem;
        }
        
        .action-buttons-wrapper { 
            top: 44px; 
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