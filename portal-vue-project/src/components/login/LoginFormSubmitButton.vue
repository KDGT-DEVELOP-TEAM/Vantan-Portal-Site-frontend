<template>
    <button class="login-button" @click="$emit('submit')">
      {{ buttonText }}
    </button>
</template>

<script>
export default {
    name: 'LoginFormSubmitButton',
    props: {
        buttonText: {
            type: String,
            default: 'ログイン'
        }
    },
    emits: ['submit']
}
</script>

<style scoped>
.login-button {
  width: 100%;
  padding: 12px;
  background-color: #f15b5b;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 30px;
  transition: background-color 0.3s;
}
.login-button:hover {
  background-color: #e04b4b;
}
</style>