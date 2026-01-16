<template>
  <button 
    @click="handleClick" 
    :disabled="isDisabled"
    :class="['action-button', user.is_active ? 'disable' : 'enable']"
  >
    {{ user.is_active ? '無効化' : '有効化' }}
  </button>
</template>

<script setup>
  import { computed, defineProps, defineEmits } from 'vue';

  const props = defineProps({
    user: {
      type: Object,
      required: true
    },
    canManageUsers: {
      type: Boolean,
      required: true
    },
    disabled: { // 自分自身の操作禁止用
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits(['request-toggle']);

  const isDisabled = computed(() => {
    return !props.canManageUsers || props.disabled;
  });

  const handleClick = () => {
    if (isDisabled.value) return;
    // 「切り替えたい」という事実のみを通知
    emit('request-toggle', props.user);
  };
</script>
  
<style scoped>
  .action-button {
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: bold;
    transition: background-color 0.3s;
    white-space: nowrap;
    min-width: 70px;
  }
  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .enable {
    /* 画像に合わせてグリーン系に調整 */
    background-color: #5cb85c; 
    color: white;
  }
  .enable:hover {
    background-color: white; 
    box-shadow: 0 0 0 2px #5cb85c inset;
    color: #5cb85c;
  }
  .disable {
    /* ★画像に合わせてグレー系に調整 */
    background-color: #aaa; 
    color: white;
  }
  .disable:hover {
    background-color: white; 
    box-shadow: 0 0 0 2px #aaa inset;
    color: #aaa;
  }
</style>