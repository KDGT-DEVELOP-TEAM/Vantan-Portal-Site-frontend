import { createRouter, createWebHistory } from 'vue-router';
import LoginScreen from '../components/login/LoginScreen.vue';
import HomeView from '../components/home/HomeView.vue';
import UserList from '../components/userManagement/UserList.vue';
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
    path: '/users', // アカウント一覧
    name: 'UserList',
    component: UserList,
    meta: { requiresAuth: true, role: 'Admin' } // 管理者のみアクセス可能と想定
  },
  {
    path: '/',
    name: 'Root',
    component: LoginScreen,
    meta: { requiresAuth: false }
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
  const requiredRole = to.meta.role; // 追加: ルートのroleメタ情報を取得
  const isAuthenticated = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole'); // 追加: ユーザーロールを取得（ログイン時にセットしておく必要あり）

  // reset-password ページは常に通す（認証不要）
  if (to.path.startsWith('/reset-password/')) {
    return next();
  }
  // 認証が必要でトークンが無い → ログインへ
  else if (requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // このURL(/users)はroleのAdminだけ通す
  if (to.path === '/users') {
    // ユーザーが未認証 or ロールがAdminでない場合
    if (!isAuthenticated || userRole !== 'admin') {
      return next('/login');
    }
  }

  // ログイン済みでログインページへ行く → home へ
  if (isAuthenticated && to.path === '/login') {
    return next('/home');
  }

  // 通常遷移
  next();
})


export default router;