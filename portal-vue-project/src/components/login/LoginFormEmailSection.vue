<template>
  <div class="input-section">
    <label class="input-label">メールアドレス <span class="required">(必須)</span></label>
    <input 
      type="email" 
      placeholder="mail@gmil.com" 
      class="input-field" 
      :value="email"
      @input="$emit('update:email', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  name: 'LoginFormEmailSection',
  props: {
      email: String // 親から受け取る現在の値
  },
  emits: ['update:email'] // 親に値を送り返すためのイベント
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
    font-size: 14px;
  }
  </style>