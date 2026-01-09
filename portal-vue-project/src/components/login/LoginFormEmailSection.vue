<template>
  <div class="input-section">
    <label class="input-label" for="email">
      メールアドレス <span class="required">(必須)</span>
    </label>

    <input
      id="email"
      type="email"
      placeholder="mail@gmail.com"
      class="input-field"
      v-model="emailValue"
    />
  </div>
</template>

<script>
export default {
  name: 'LoginFormEmailSection',
  props: {
    email: {
      type: String,
      required: true,
    },
  },
  emits: ['update:email'],
  computed: {
    emailValue: {
      get() {
        return this.email;
      },
      set(value) {
        this.$emit('update:email', value);
      },
    },
  },
};
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
    color: #f15b5b;
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