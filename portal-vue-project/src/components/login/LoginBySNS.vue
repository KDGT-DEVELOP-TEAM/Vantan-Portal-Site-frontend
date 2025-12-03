<template>
    <button class="sns-button" :class="snsType">
      <img :src="iconPath" :alt="snsType + 'アイコン'" class="sns-icon" />
    </button>
</template>

<script>
export default {
    name: 'LoginBySNS',
    props: {
        snsType: {
            type: String,
            required: true,
            validator: (value) => ['google', 'apple'].includes(value) // 例として
        }
    },
    computed: {
        iconPath() {
            // 実際のアイコンパスに置き換えてください
            return `/icons/${this.snsType}-icon.svg`; 
        }
    }
}
</script>

<style scoped>
.sns-button {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 5px;
    transition: box-shadow 0.3s;
}
.sns-button:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
.sns-icon {
    width: 20px;
    height: 20px;
}
</style>