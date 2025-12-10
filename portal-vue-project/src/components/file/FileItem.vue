<template>
    <li class="file-card" @click="$emit('view-detail', file.id)">
      <div class="file-card-header">
        <span class="file-card-title">{{ file.title }}</span>
        <span class="file-card-format">
          ファイル形式: {{ fileExtension.toUpperCase() }} | 公開日: {{ formatDate(file.created_at) }}
        </span>
      </div>
      
      <div class="file-card-image-area">
        <template v-if="attachedFileUrl && isImage && !imageLoadError">
          <img 
            :src="attachedFileUrl" 
            :alt="file.title + 'のプレビュー'" 
            class="file-preview-image" 
            @error="handleImageError"
          />
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
          class="file-card-download"
          @click.stop
        >
          ダウンロード
        </a>
        
        <button 
          v-if="userRole === 'admin'" 
          class="file-card-delete"
          @click.stop="$emit('delete', file.id)"
          title="ファイルを削除"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </li>
  </template>
  
  <script>
  const FILE_ENDPOINT = '/api/file/';
  
  export default {
    name: 'FileItem',
    props: {
      file: {
        type: Object,
        required: true,
        // file オブジェクトは attached_file プロパティ（ファイルのURL/パス）を持っている必要があります。
        // { id: 'uuid', title: 'ファイル名', created_at: '日付', attached_file: '/media/user_files/...' }
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
            // 画像ロードエラーフラグ: true になると、アイコン表示に切り替わる
            imageLoadError: false,
        };
    },
    
    computed: {
      /**
       * 添付ファイルのURLから拡張子を取得する
       */
      fileExtension() {
          const urlPath = this.file.attached_file; 
          if (!urlPath) return '不明';
          
          // URLの最後のパス部分を取得
          const path = urlPath.split('/').pop();
          
          // パスを拡張子で分割。URLパラメータ(?download=trueなど)も考慮
          const parts = path.split('.');
          if (parts.length > 1) {
              // 拡張子(.を含まない)を取得し、小文字化
              const cleanExt = parts.pop().split('?')[0];
              return cleanExt.toLowerCase();
          }
          
          return '不明';
      },
  
      /**
       * 添付ファイルの完全なURLを構築
       * 🚨 画像が表示されない原因の多くはここにあるため、URL構築ロジックをシンプルに維持
       */
      attachedFileUrl() {
          if (!this.file.attached_file || !this.apiBaseUrl) return null;
          
          const urlPath = this.file.attached_file;
          
          // 1. 既に完全なURLが返されている場合はそのまま返す
          if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
              return urlPath;
          }                                        
          // 2. 相対パスの場合、ベースURLと結合して完全なURLを生成
          // 例: 'http://127.0.0.1:8085' + '/media/...'
          const baseUrl = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
          const path = urlPath.startsWith('/') ? urlPath : '/' + urlPath;                                        
          return baseUrl + path;
      },
  
      /**
       * 画像ファイルかどうかの判定 (png/jpg/gif/svg/bmp)
       */
      isImage() {
          const ext = this.fileExtension;
          // 🚨 画像が表示されない場合、このリストに拡張子が含まれているか確認
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
        // ロードエラーが発生したため、フラグを立ててアイコン表示に切り替える
        this.imageLoadError = true;
        console.error('Failed to load image for file:', this.file.title, 'URL:', this.attachedFileUrl);
        // 一度エラーになったら、リロードするまで画像表示は試みない
      }
    }
  };
  </script>
  
  <style scoped>
  /* --- スタイルは変更なし --- */
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
    transition: box-shadow .11s;
  }
  .file-card:hover {
    box-shadow: 0 2px 8px #f1494c15;
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
  
  /* 🚨 実際の画像に対するスタイル (追加・修正) */
  .file-preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover; 
    display: block;
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
    bottom: 13px;
    right: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 3;
    pointer-events: auto;
  }
  
  .file-card-download {
    color: #F1494C;
    border: 1px solid #F1494C;
    background: #fff;
    font-size: 13px;
    font-weight: bold;
    padding: 6px 17px;
    border-radius: 4px;
    text-decoration: none;
    transition: background .12s, color .12s;
  }
  .file-card-download:hover {
    background: #F1494C;
    color: #fff;
  }
  
  .file-card-delete {
    background: #F1494C;
    color: #fff;
    border: none;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s;
  }
  .file-card-delete:hover {
    background: #cc0000;
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