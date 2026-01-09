<template>
    <button 
      @click="handleEditClick" 
      :disabled="!canManageUsers"
      :class="['action-button', 'edit-button']"
      title="ユーザー情報を編集"
    >
        <span v-if="isMobile" class="center">
            <span class="material-symbols-outlined">person_edit</span>
        </span>
        <span v-else>
            編集
        </span>
    </button>
</template>

<script>
export default {
    name: 'UserEditButton',
    props: {
        // 編集対象のユーザーデータ
        user: {
            type: Object,
            required: true
        },
        // 現在のユーザーが管理者かどうか
        canManageUsers: {
            type: Boolean,
            required: true
        }
    },
    // 親コンポーネントにユーザーデータを渡すイベント
    emits: ['editSelected'], 
    data() {
      return {
        isMobile: false,
      };
    },
    mounted() {
      this.checkMobile();
      window.addEventListener("resize", this.checkMobile);
    },
  
    beforeUnmount() {
      window.removeEventListener("resize", this.checkMobile);
    },
    methods: {
        checkMobile() {
          this.isMobile = window.innerWidth < 700;
        },
        handleEditClick() {
            // 管理者権限がない場合は何もしない
            if (!this.canManageUsers) return;
            // 親コンポーネントに編集対象のユーザーデータを渡す
            this.$emit('editSelected', this.user);
        }
    }
}
</script>

<style scoped>
/* 既存のUserEnableButtonなどのスタイルと共通のaction-buttonスタイルを想定 */
.action-button {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s, color 0.2s, opacity 0.2s;
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}

.edit-button {
    background-color: white;
    border: 1px solid #007bff; /* 青色系の色で強調 */
    color: #007bff;
}

.edit-button:hover:not(:disabled) {
    background-color: #007bff;
    color: white;
}

.edit-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.material-symbols-outlined {
    font-size: 16px;
    vertical-align: middle;
}
.icon-center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1 1 0;
}
</style>