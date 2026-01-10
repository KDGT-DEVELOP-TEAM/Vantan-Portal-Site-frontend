import { createRouter, createWebHistory } from 'vue-router';
import axiosInstance from '@/api/axiosInstance';

import LoginScreen from '@/components/login/LoginScreen.vue';
import HomeView from '@/components/home/HomeView.vue';
import TimeScheduleList from '@/components/timeSchedule/TimeScheduleList.vue'; 
import AddTimeScheduleScreen from '@/components/timeSchedule/addTimeSchedule/TimeScheduleScreen.vue';

import { hasPermission } from '@/utils/permission';
import Forbidden403 from '@/components/error/Forbidden403.vue';
import NotFound404 from '@/components/error/NotFound404.vue';

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
    path: '/timeschedules', 
    name: 'TimeScheduleList',
    component: TimeScheduleList,
    meta: { requiresAuth: true }
  },
  {
    path: '/timeschedules/create', 
    name: 'AddTimeSchedule',
    component: AddTimeScheduleScreen, // 新規作成画面コンポーネント
    meta: { requiresAuth: true, permission: 'timeschedule_manage' } // 管理者のみ許可
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