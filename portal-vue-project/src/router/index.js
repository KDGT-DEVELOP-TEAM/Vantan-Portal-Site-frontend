import { createRouter, createWebHistory } from 'vue-router';

import LoginScreen from '@/components/login/LoginScreen.vue';
import HomeView from '@/components/home/HomeView.vue';
import FileList from '@/components/file/FileList.vue';

import { hasPermission } from '@/utils/permission';
import Forbidden403 from '@/components/error/Forbidden403.vue';
import NotFound404 from '@/components/error/NotFound404.vue';

// import NewsList from '@/components/news/NewsList.vue'; // 例

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
    path: '/files', // ファイル一覧画面のURL
    name: 'FileList',
    component: FileList,
    meta: { requiresAuth: true } // 認証必要
  },
  {
    path: '/',
    name: 'Root',
    component: LoginScreen,
    meta: { requiresAuth: false }
  },
  {
    path: '/403',
    name: 'Forbidden403',
    component: Forbidden403,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound404',
    component: NotFound404,
    meta: { requiresAuth: false }
  }
//   {
//     path: '/news', // お知らせ一覧のURL
//     name: 'NewsList',
//     component: NewsList,
//     meta: { requiresAuth: true }
//   },
  // 他のURLパス（/galleries, /timeschedules, /users など）をここに追加...
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  // パスワードリセットなどは無条件許可
  if (to.path.startsWith('/reset-password/')) {
    return next()
  }

  // 認証不要ページ
  if (to.meta.requiresAuth === false) {
    return next()
  }

  // トークンチェック
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return next('/login')
  }

  // 権限チェック
  if (to.meta.permission) {
    if (!hasPermission(to.meta.permission)) {
      return next('/403')
    }
  }

  next()
});

export default router;