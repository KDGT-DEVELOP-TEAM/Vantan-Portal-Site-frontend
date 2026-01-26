<template>
  <button
    class="delete-button"
    :disabled="isLoading || !canManageUsers"
    @click="$emit('request-delete', userId)"
    :aria-label="$t('user.actions.delete')"
  >
    <span v-if="isLoading">{{ $t('common.deleting') }}</span>
    <span v-else>{{ $t('user.actions.delete') }}</span>
  </button>
</template>

<script>
  export default {
    name: 'UserDeleteButton',
    props: {
      userId: {
        type: [String, Number],
        required: true,
      },
      canManageUsers: {
        type: Boolean,
        required: true,
      },
      isLoading: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['request-delete'],
  };
</script>

<style scoped>
  .delete-button {
    background-color: #F1494C;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    padding: 8px 12px;
    font-size: 0.9em;
    transition: background-color 0.3s;
    white-space: nowrap;
  }
  .delete-button:hover:not(:disabled) {
    background-color: white;
    box-shadow: 0 0 0 2px #F1494C inset;
    color: #F1494C;
  }
  .delete-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
