<template>
    <div class="schedule-card" @click="$emit('view-detail', schedule.id)">
      <div class="card-title">{{ schedule.title }}</div>
      <div class="card-image-container">
        <img v-if="schedule.image_url" :src="schedule.image_url" alt="時間割画像" class="card-image">
        <div v-else class="placeholder-image">画像/PDF</div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    schedule: {
      type: Object,
      required: true,
      default: () => ({ 
        id: 'mock-id', 
        title: 'モックデータタイトル', 
        grade: 1, 
        image_url: null 
      })
    }
  });
  
  const emits = defineEmits(['view-detail']);
  </script>
  
  <style scoped>
  .schedule-card {
    /* デザインイメージに合わせて、カード形式の基本スタイルを設定 */
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s;
    background-color: #fff;
    /* カード間のマージン */
    margin-bottom: 20px; 
  }
  
  .schedule-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .card-title {
    background-color: #F1494C; /* 仮のアクセントカラー */
    color: white;
    padding: 10px;
    font-weight: bold;
    text-align: center;
    /* タイトルが長すぎるときは省略 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .card-image-container {
    height: 200px; /* 画像エリアの高さ */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f7f7f7;
  }
  
  .placeholder-image {
    color: #aaa;
    font-size: 1.1rem;
  }
  
  .card-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  </style>