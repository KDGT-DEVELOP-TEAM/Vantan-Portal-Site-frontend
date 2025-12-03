<template>
    <a :href="`/news/${item.id}`" class="news-card-link">
      <div class="news-card">
        <div class="news-content">
          
          <span 
            v-if="!item.isDimmed" 
            class="bullet-point"
          ></span>
  
          <div class="text-info">
            <p
              class="news-title"
              :class="{'is-dimmed': item.isDimmed, 'is-bold': !item.isDimmed}"
            >
              {{ item.title }}
            </p>
            <p class="news-date" :class="{'is-dimmed': item.isDimmed}">
              {{ item.date }}
            </p>
          </div>
        </div>
  
        <div v-if="userRole === 'admin'" class="action-buttons">
          <button class="edit-btn" @click.prevent.stop="$emit('edit', item.id)">
            <span class="material-symbols-outlined edit-icon">
              border_color
            </span>
          </button>
          <button class="delete-btn" @click.prevent.stop="$emit('delete', item.id)">
            <span class="material-symbols-outlined delete-icon">
              delete
            </span>
          </button>
        </div>
  
        <hr class="separator"/>
      </div>
    </a>
  </template>
  
  <script>
  export default {
      name: 'NewsCard',
      props: {
          item: {
              type: Object,
              required: true,
              // item の構造: { id: 1, title: 'タイトルタイトル...', date: '2025/01/01', isDimmed: false }
          },
          userRole: {
              type: String,
              required: true,
          }
      },
      emits: ['edit', 'delete']
  }
  </script>
  
  <style scoped>
  /* NewsCard.vue のスタイル (デザイン画像に合わせて修正) */
  
  .news-card-link {
      text-decoration: none;
      color: inherit;
      display: block;
  }
  
  .news-card {
      display: flex;
      flex-direction: column;
      padding: 10px 0;
      position: relative; 
      cursor: pointer;
  }
  
  /* マウスホバー時の視覚効果 */
  .news-card:hover {
      background-color: #f5b9b97a; 
  }
  
  .news-content {
      display: flex;
      align-items: flex-start;
      flex-grow: 1;
  }
  
  .text-info {
      flex-grow: 1;
      min-width: 0; 
      margin-right: 10px;
      padding-right: 80px; /* アイコン領域との重なりを防ぐため */
  }
  
  .bullet-point {
      width: 8px;
      height: 8px;
      min-width: 8px; 
      min-height: 8px;
      border-radius: 100%;
      background-color: #F1494C;
      margin-right: 15px;
      margin-top: 15px; 
      margin-left: 15px;
  }
  
  .news-title {
      margin: 0;
      font-size: 1rem;
      color: #F1494C;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
      text-align: left;
      justify-content: flex-start;
      font-weight: normal; /* 既定ではノーマル */
      transition: color 0.2s, font-weight 0.2s;
  }

  /* 未読（isDimmed: false）のタイトルをボールド */
  .news-title.is-bold {
    font-weight: bold;
    color: #F1494C;
  }
  
  /* 既読（is-dimmed）のタイトルと日付：薄く */
  .news-title.is-dimmed {
      color: #FF9999;
      font-weight: normal;
      margin-left: 38px;
      text-align: left;
      justify-content: flex-start;
      transition: color 0.2s;
  }
  /* ホバー時は色を元に戻す */
  .news-card:hover .news-title.is-dimmed {
      color: #F1494C;
  }

  .news-date.is-dimmed {
    margin-left: 38px;
    font-weight: normal;
    text-align: left;
    justify-content: flex-start;
  }
  
  .news-date {
      margin: 0;
      font-size: 0.8rem;
      color: #888;
      text-align: left;
      justify-content: flex-start;
  }
  
  .action-buttons {
      display: flex;
      gap: 5px;
      margin-left: auto;
      align-self: center;
      position: absolute; 
      right: 0; 
      top: 50%; 
      transform: translateY(-50%);
      margin-right: 15px;
  }
  
  .action-buttons button {
      background: none;
      border: none; /* ★修正: 枠線をなくす */
      border-radius: 0; /* ★修正: 角丸をなくす */
      cursor: pointer;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      transition: background-color 0.2s;
      line-height: 1;
  }
  
  .material-symbols-outlined {
    color: white;
    font-size: 18px;
    border-radius: 5px;
    padding: 0 5px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .edit-icon {
      color: white;
      background-color: #7FB922;
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; 
  }
  
  .delete-icon {
      color: white;
      background-color: #F1494C;
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  
  .edit-icon:hover {
    background-color: white;
    color: #7FB922;
    border: 1px solid #7FB922;
  }

  .delete-icon:hover {
    background-color: white;
    color: #F1494C;
    border: 1px solid #F1494C;
  }
  
  .separator {
      border: 0;
      border-top: 1px solid #2C2C2C;
      height: 1px;
      margin-top: 15px;
      margin-bottom: 0;
      background: none;
      width: calc(100% - 38px);
      display: block;
      box-sizing: content-box;
      box-shadow: none;
  }
  
  .news-card-link:last-of-type .separator {
      display: none;
  }
  </style>