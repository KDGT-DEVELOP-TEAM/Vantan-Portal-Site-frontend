import { createRouter, createWebHistory } from 'vue-router';
import LoginScreen from '../components/login/LoginScreen.vue';
import HomeView from '../components/home/HomeView.vue';
import FileList from '../components/file/FileList.vue';
// import NewsList from '../components/news/NewsList.vue'; // 例

const routes = [
  {
    path: '/login', // ログイン画面のURL
    name: 'Login',
    component: LoginScreen,
    meta: { requiresAuth: false } // 認証不要
  },
  {
    path: '/home', // ホーム画面のURL
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true } // 認証必要
  },
  {
    path: '/',
    redirect: '/login' // root URL にアクセスした場合に /login に転送
  },
  {
    path: '/files', // ファイル一覧画面のURL
    name: 'FileList',
    component: FileList,
    meta: { requiresAuth: true } // 認証必要
  },
//   {
//     path: '/news', // お知らせ一覧のURL
//     name: 'NewsList',
//     component: NewsList,
//     meta: { requiresAuth: true }
//   },
  // 他のURLパス（/galleries, /timeschedules, /users など）をここに追加...
];

const router = createRouter({
  //  修正箇所: process.env.BASE_URL を import.meta.env.BASE_URL に変更
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ナビゲーションガード (認証チェック) の追加
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = localStorage.getItem('accessToken'); // トークンの有無で認証判定

  if (requiresAuth && !isAuthenticated) {
    // 認証が必要なのにトークンがない場合はログイン画面にリダイレクト
    next('/login');
  } else if (isAuthenticated && to.path === '/login') {
    // ログイン済みで /login にアクセスしようとした場合は /home にリダイレクト
    next('/home');
  } else {
    // それ以外は通常通り遷移
    next();
  }
});

export default router;