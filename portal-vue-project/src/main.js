import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { checkAuth } from '@/store/authState';

const app = createApp(App);

checkAuth().then(() => {
  app.use(router).mount('#app');
});
