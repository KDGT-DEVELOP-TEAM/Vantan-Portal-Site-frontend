<template>
    <div class="sns-section-container">
        <div class="separator">
            <span>または</span>
        </div>
        <div class="sns-buttons">
            <LoginBySNS snsType="google" />
            <LoginBySNS snsType="apple" />
        </div>
    </div>
</template>

<script>
import LoginBySNS from './LoginBySNS.vue';

export default {
    name: 'LoginBySNSSection',
    components: {
        LoginBySNS
    }
}
</script>

<style scoped>
.sns-section-container {
    margin-top: 30px;
    text-align: center;
}
.separator {
    position: relative;
    margin: 30px 0 20px 0;
    text-align: center;
}
.separator span {
    background-color: white;
    padding: 0 10px;
    color: #999;
    font-size: 14px;
    position: relative;
    z-index: 2;
}
.separator::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    border-top: 1px solid #ddd;
    z-index: 1;
}
.sns-buttons {
    display: flex;
    justify-content: center;
}
</style>