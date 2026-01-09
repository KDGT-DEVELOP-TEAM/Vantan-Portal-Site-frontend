<template>
  <button
    @click="deleteUser"
    :disabled="isLoading || !canManageUsers"
    class="delete-button"
  >
    <span v-if="isLoading">削除中...</span>
    <span v-else>削除</span>
  </button>
</template>

<script>
export default {
  name: "UserDeleteButton",

  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    canManageUsers: {
      type: Boolean,
      required: true
    }
  },

  emits: ["deleted"],
  methods: {
    deleteUser() {
      if (!this.canManageUsers) return;
      this.$emit('request-delete', this.userId);
    }
  },
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
.delete-button:hover {
  background-color: white;
  box-shadow: 0 0 0 2px #F1494C inset;
  color: #F1494C;
}
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
