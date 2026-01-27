import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n/index.js';
import { checkAuth } from '@/store/authState';

const app = createApp(App);

app.use(i18n);
app.use(router);

checkAuth()
  .catch((e) => {
    // 必要ならログだけ出す（アプリ起動は止めない）
    console.error('[checkAuth] failed:', e);
  })
  .finally(() => {
    app.mount('#app');
  });
