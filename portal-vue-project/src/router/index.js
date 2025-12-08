import { createRouter, createWebHistory } from 'vue-router';
import LoginScreen from '../components/login/LoginScreen.vue';
import HomeView from '../components/home/HomeView.vue';
import NewsList from '../components/newsList/NewsListScreen.vue';
import NewsDetailScreen from '../components/newsList/NewsDetailScreen.vue';

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
    path: '/news', // お知らせ一覧のURL
    name: 'NewsList',
    component: NewsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/news/:id', 
    name: 'NewsDetail', // ルート名
    component: NewsDetailScreen, // 使用するコンポーネント
    props: true, // コンポーネントにURLのパラメーターをpropsとして渡す設定
  },
  {
    path: '/news/create',
    name: 'NewsCreate',
    component: () => import('../components/newsList/addNews/AddNewsScreen.vue'), 
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/news/:id/edit',
    name: 'NewsEdit',
    component: () => import('../components/newsList/editNews/EditNewsScreen.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
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
  const requiresAdmin = to.meta.requiresAdmin;
  const userRole = localStorage.getItem('userRole'); // userRoleの取得

  if (requiresAuth && !isAuthenticated) {
    // 認証が必要なのにトークンがない場合はログイン画面にリダイレクト
    next('/login');
  } 
  if (isAuthenticated && to.path === '/login') {
    // ログイン済みで /login にアクセスしようとした場合は /home にリダイレクト
    next('/home');
  } 

  if (isAuthenticated && requiresAdmin) {
    // ロールが 'admin' ではない、または userRole が未設定の場合は権限不足
    if (userRole !== 'admin') { 
      console.warn('権限エラー: 管理者のみアクセス可能です。');
      
      // 権限がない場合はお知らせ一覧ページへリダイレクト
      return next('/login');
    }
  }

  // それ以外は通常通り遷移
  next();
  }
);

export default router;