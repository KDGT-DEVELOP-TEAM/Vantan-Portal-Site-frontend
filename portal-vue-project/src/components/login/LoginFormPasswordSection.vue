<template>
  <div class="input-section">
    <label class="input-label">パスワード <span class="required">(必須)</span></label>
    <input 
      type="password" 
      :placeholder="$t('login.password.hint')" 
      class="input-field" 
      :value="password"
      @input="$emit('update:password', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  name: 'LoginFormPasswordSection',
  props: {
      password: String // 親から受け取る現在の値
  },
  emits: ['update:password'] // 親に値を送り返すためのイベント
}
</script>
  
  <style scoped>
  .input-section {
    margin-bottom: 25px;
  }
  .input-label {
    display: block;
    text-align: left;
    font-size: 14px;
    margin-bottom: 5px;
    color: #333;
  }
  .required {
    color: #f15b5b; /* 赤色 */
    font-weight: normal;
  }
  .input-field {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 12px; /* プレースホルダーが長いためフォントを小さく */
  }
  </style>