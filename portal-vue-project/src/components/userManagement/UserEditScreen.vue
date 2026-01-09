<template>
    <div class="user-edit-screen-container">
        <div class="header">
            <h2>ユーザー情報編集 ({{ initialUser.email }})</h2>
            <button @click="$emit('cancelEdit')" class="back-button">
                <span class="material-symbols-outlined">arrow_back_ios</span>
                戻る
            </button>
        </div>

        <form @submit.prevent="handleSubmit" class="edit-user-form">
            
            <EmailSection v-model="formData.email" :error="errors.email" />

            <NameSection v-model="formData.name" :error="errors.user_name" />

            <PasswordSection v-model="formData.password" :error="errors.password" :is-optional="true" />

            <ConfirmPasswordSection v-model="formData.passwordConfirm" :error="errors.passwordConfirm" />

        
            <div class="form-section">
                <label for="role">ロール <span class="required">(必須)</span></label>
                <select id="role" v-model="formData.role" required class="form-select select-dropdown grade-hover-select">
                    <option value="viewer">保護者</option>
                    <option value="admin">管理者</option>
                </select>
                <div v-if="errors.role" class="input-error">{{ errors.role }}</div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="submit-button" :disabled="isLoading">
                    {{ isLoading ? '更新中...' : '更新を保存' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
// AddUserScreenで利用しているコンポーネントを流用
import EmailSection from './form/EmailSection.vue'; 
import PasswordSection from './form/PasswordSection.vue';
import ConfirmPasswordSection from './form/ConfirmPasswordSection.vue';
import NameSection from './form/NameSection.vue';

// APIのベースURL
import { userApi } from '@/api/userManagementApi';

export default {
    name: 'UserEditScreen',
    components: {
        EmailSection,
        PasswordSection,
        ConfirmPasswordSection,
        NameSection,
    },
    props: {
        // 親から渡される編集対象のユーザーオブジェクト
        initialUser: {
            type: Object,
            required: true,
        }
    },
    emits: ['userUpdated', 'cancelEdit', 'error'], // 更新成功時とキャンセル時のイベント

    data() {
        return {
            formData: {
                email: this.initialUser.email,
                name: this.initialUser.user_name || '', // バックエンドのフィールド名がuser_nameと仮定
                password: '', 
                passwordConfirm: '',
                role: this.initialUser.role,
            },
            isLoading: false,
            errors: {},
        };
    },

    watch: {
        // 編集対象ユーザーが変わったときにフォームも更新する
        initialUser: {
            handler(newUser) {
                this.formData.email = newUser.email;
                this.formData.name = newUser.user_name || '';
                this.formData.role = newUser.role;
                this.formData.password = '';
                this.formData.passwordConfirm = '';
                this.errors = {};
            },
            immediate: true,
            deep: true,
        }
    },

    methods: {
        clearValidationErrors() {
            this.errors = {};
        },

        async handleSubmit() {
            if (this.isLoading) return;

            this.isLoading = true;
            this.clearValidationErrors();

            // フロント側の最低限バリデーション
            if (
                this.formData.password &&
                this.formData.password !== this.formData.passwordConfirm
            ) {
                this.errors.passwordConfirm = 'パスワードが一致しません。';
                this.isLoading = false;
                return;
            }

            const payload = {
                email: this.formData.email,
                user_name: this.formData.name,
                role: this.formData.role,
            };

            if (this.formData.password) {
                payload.password = this.formData.password;
            }

            try {
                await userApi.update(this.initialUser.id, payload);

                // 成功は「通知」じゃなく「イベント」
                this.$emit('userUpdated');

                this.formData.password = '';
                this.formData.passwordConfirm = '';
            } catch (e) {
                // エラーも親に渡す
                this.$emit('error', e);
            } finally {
                this.isLoading = false;
            }
        }
    },
};
</script>

<style scoped>
.user-edit-screen-container {
    padding: 0;
    margin: 0;
    box-shadow: none;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 0;
    text-align: left;
}

h2 {
    font-size: 1.5em;
    color: #F1494C;
    font-weight: bold;
}

.back-button {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 1em;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
}

.back-button:hover {
    background-color: #f0f8ff;
}

.material-symbols-outlined {
    font-size: 1.1em;
}

.edit-user-form {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}

/* ▼▼ AddUserForm と完全同じデザイン ▼▼ */

.form-section {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
}

.required {
    color: #dc3545;
    margin-left: 4px;
}

/* セレクトメニュー基本スタイル */
.form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
    height: 40px;
    appearance: none;
}

/* AddUserForm と同じドロップダウン見た目 */
.select-dropdown {
    width: 20%;
    padding: 8px 10px;
    border: 1px solid #FF9999;
    border-radius: 4px;
    font-size: 1rem;
    background-color: white;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    position: relative;
    top: -2px;
}

/* ホバー・フォーカス時の演出 */
.grade-hover-select:hover {
    background-color: #FFF7F7 !important;
    border: 1px solid #F1494C !important;
}

.grade-hover-select:hover,
.grade-hover-select:focus {
    outline: none;
}

/* ▼▼ メッセージとボタン ▼▼ */

.submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #F1494C;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
    background-color: white;
    box-shadow: inset 0 0 0 2px #F1494C;
    color: #F1494C;
}

.submit-button:disabled {
    background-color: #f9d3d3;
    cursor: not-allowed;
}

.success-alert {
    padding: 15px;
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    margin-bottom: 20px;
    font-weight: bold;
}

.error-alert {
    padding: 15px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin-bottom: 20px;
    font-weight: bold;
}

.input-error {
    color: #dc3545;
    font-size: 0.8em;
    margin-top: 5px;
}

.form-actions {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 24px;
}

.submit-button {
    width: 100%;
    max-width: 100%;
    padding: 10px 0;
    font-size: 1em;
    border: none;
    border-radius: 5px;
    background-color: #F1494C;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    box-shadow: 0 2px 6px rgba(241, 73, 76, 0.10);
}

.submit-button:disabled {
    background-color: #f9d3d3;
    cursor: not-allowed;
}
</style>