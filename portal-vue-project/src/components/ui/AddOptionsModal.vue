<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button
        type="button"
        class="close-button"
        :aria-label="$t('common.close')"
        @click="$emit('close')"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <ul class="option-list">
        <li v-for="opt in options" :key="opt.id" class="option-item">
          <!-- event がある場合は emit（拡張用） -->
          <button
            v-if="opt.event"
            type="button"
            class="option-item-content option-button"
            @click="selectOption(opt.event)"
          >
            <span class="option-text">{{ $t(opt.labelKey) }}</span>
            <span class="material-symbols-outlined arrow-icon">chevron_right</span>
          </button>

          <!-- 通常は router-link（name指定に統一） -->
          <router-link
            v-else
            :to="opt.to"
            class="option-item-content"
            @click="$emit('close')"
          >
            <span class="option-text">{{ $t(opt.labelKey) }}</span>
            <span class="material-symbols-outlined arrow-icon">chevron_right</span>
          </router-link>

          <hr class="divider" />
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
        // name 指定に統一（router の name と一致）
        // i18n：label は labelKey で管理
        // key：翻訳で変わらない id を使用
        options: [
          {
            id: 'news',
            labelKey: 'modal.addOptions.addNews',
            to: '/news/create',
          },
          {
            id: 'gallery',
            labelKey: 'modal.addOptions.addArticle',
            to: '/gallery/create',
          },
          {
            id: 'timeschedule',
            labelKey: 'modal.addOptions.addTimeSchedule',
            to: '/timeschedules/create',
          },
        ],
      };
    },
    methods: {
      selectOption(eventName) {
        this.$emit('select-option', eventName);
        this.$emit('close');
      },
    },
  };
</script>

<style scoped>
  /* 画面全体を覆うオーバーレイ */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
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

  /* router-link / button 共通 */
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
    border-radius: 5px;
  }

  /* button 化（デフォルトのボタンスタイルを消す） */
  .option-button {
    width: 100%;
    background: transparent;
    border: none;
    text-align: left;
    font: inherit;
  }

  /* ホバー時 (背景が赤、文字が白) */
  .option-item-content:hover {
    background-color: #ff0000;
    color: white;
    border-radius: 5px;
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

  /* ホバー時にdividerを非表示 */
  .option-item:hover > .divider {
    opacity: 0;
    visibility: hidden;
    height: 0;
    margin: 0;
    pointer-events: none;
  }

  /* 矢印アイコン */
  .option-item-content:hover .arrow-icon {
    color: white;
  }

  .arrow-icon {
    color: #ff0000;
    font-size: 24px;
    transition: color 0.3s;
  }

  /* Material Symbols */
  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }

  /* スマホ対応 */
  @media (max-width: 780px) {
    .modal-content {
      padding: 30px 25px;
      width: calc(100vw - 48px);
      max-width: 450px;
    }

    .close-button {
      top: 5px;
      right: 5px;
    }

    .option-item-content {
      padding: 10px 5px;
      font-size: 0.95rem;
    }
  }
</style>