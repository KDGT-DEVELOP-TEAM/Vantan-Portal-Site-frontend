<template>
  <button
    @click="deleteUser"
    :disabled="isLoading || !isCurrentUserAdmin"
    class="delete-button"
  >
    <span v-if="isLoading">削除中...</span>
    <span v-else>削除</span>
  </button>
</template>

<script>
import { userApi } from '@/api/userManagementApi'; // あなたのAPI呼び出しモジュール

export default {
  name: "UserDeleteButton",

  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    isCurrentUserAdmin: {
      type: Boolean,
      required: true
    }
  },

  emits: ["deleted", "error"],

  data() {
    return {
      isLoading: false,
    };
  },

  methods: {
    async deleteUser() {
      if (this.isLoading || !this.isCurrentUserAdmin) return;

      // 削除の確認ダイアログをここに入れる（親に任せると面倒なので）
      if (!window.confirm("本当にこのユーザーを削除しますか？ この操作は元に戻せません。")) {
        return;
      }

      this.isLoading = true;
      try {
        await userApi.delete(this.userId);
        this.$emit("deleted", this.userId);
      } catch (error) {
        this.$emit("error", `削除に失敗しました: ${error.message || error}`);
      } finally {
        this.isLoading = false;
      }
    },
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
