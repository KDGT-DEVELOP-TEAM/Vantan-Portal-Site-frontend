<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">

      <button class="close-button" @click="$emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>

      <ul class="option-list">
        <li
          v-for="opt in options"
          :key="opt.label"
          class="option-item"
        >
          <div
            v-if="opt.event"
            class="option-item-content"
            @click="$emit('select-option', opt.event)"
          >
            <span class="option-text">{{ opt.label }}</span>
            <span class="material-symbols-outlined arrow-icon">chevron_right</span>
          </div>
          <router-link
            v-else
            :to="opt.route"
            class="option-item-content"
          >
            <span class="option-text">{{ opt.label }}</span>
            <span class="material-symbols-outlined arrow-icon">chevron_right</span>
          </router-link>

          <hr class="divider">
        </li>
      </ul>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AddOptionsModal',
  emits: ['close', 'select-option'],
  data() {
    return {
      options: [
        { label: 'お知らせ追加', route: '/news/create' },
        { label: '記事追加', route: '/gallery/create' },
        { label: '時間割追加', route: '/timeschedules/create' }
      ]
    }
  }
}
</script>

  
  <style scoped>
  /* 画面全体を覆うオーバーレイ */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 背景を暗くする */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  
  /* モーダルのコンテンツボックス */
  .modal-content {
    background-color: white;
    border-radius: 10px;
    width: 450px;
    padding: 20px 40px;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  /* 閉じるボタン */
  .close-button {
    position: absolute;
    top: 10px;
    right: 5px;
    background: none;
    border: none;
    color: #ff0000;
    cursor: pointer;
    font-size: 24px;
    padding: 5px;
    line-height: 1;
  }
  
  .close-button .material-symbols-outlined {
      font-size: 24px;
  }
  
  /* リスト */
  .option-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  /* リスト項目 */
  .option-item {
    position: relative;
    padding: 0;
  }
  .option-item-content {
    display: flex;
    text-decoration: none;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding: 15px 10px;
    cursor: pointer;
    color: #ff0000;
    transition: background-color 0.3s, color 0.3s;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 5px; /* デフォルトで角を丸くする */
  }
  
  /* ★ホバー時のスタイル (背景が赤、文字が白) */
  .option-item-content:hover {
    background-color: #ff0000; 
    color: white; 
    border-radius: 5px; /* ホバー時に角を丸くする */
  }

  .option-text {
    padding-top: 4px;
    display: inline-block;
  }
  
  /* 区切り線 */
  .divider {
    border: none;
    border-top: 1px solid #ff0000;
    margin: 0 3px;
    transition: opacity 0.3s;
  }

  /* ホバー時にdividerを非表示にする */
  .option-item:hover > .divider {
    opacity: 0;
    visibility: hidden;
    height: 0;
    margin: 0;
    pointer-events: none;
  }
  
  /* ホバー時のリスト項目内の矢印アイコンの色を制御 */
  .option-item-content:hover .arrow-icon {
      color: white;
  }
  
  .arrow-icon {
      color: #ff0000;
      font-size: 24px;
      transition: color 0.3s;
  }
  
  /* Material Symbols のスタイルを念のためローカルでも定義 */
  .material-symbols-outlined {
      font-variation-settings:
        'FILL' 0, /* モーダル内のアイコンは塗りつぶしなし (デフォルト) */
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;
  }
  /* スマホ対応 */
@media (max-width: 780px) {
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* 背景を暗くする */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .modal-content {
        padding: 30px 25px;
    }
    /* 閉じるボタン */
    .close-button {
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: #ff0000;
      cursor: pointer;
      font-size: 24px;
      padding: 5px;
      line-height: 1;
    }
    .option-item-content {
        padding: 10px 5px;
        font-size: 0.95rem;
    }
    /* ★ホバー時のスタイル (背景が赤、文字が白) */
    .option-item-content:hover {
      background-color: #ff0000; 
      color: white; 
      border-radius: 5px; /* ホバー時に角を丸くする */
    }
    /* ホバー時にdividerを非表示にする */
    .option-item:hover > .divider {
      opacity: 0;
      visibility: hidden;
      height: 0;
      margin: 0;
      pointer-events: none;
    }
    
    /* ホバー時のリスト項目内の矢印アイコンの色を制御 */
    .option-item-content:hover .arrow-icon {
        color: white;
    }
}
  </style>