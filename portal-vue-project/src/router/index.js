import { createRouter, createWebHistory } from 'vue-router';
import axiosInstance from '@/api/axiosInstance';

import LoginScreen from '../components/login/LoginScreen.vue';
import HomeView from '../components/home/HomeView.vue';
import TimeScheduleList from '../components/timeSchedule/TimeScheduleList.vue'; 
import AddTimeScheduleScreen from '../components/timeSchedule/addTimeSchedule/TimeScheduleScreen.vue';

import Forbidden403 from '../components/error/Forbidden403.vue'
import NotFound404 from '../components/error/NotFound404.vue'


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
  // process.env.BASE_URL を import.meta.env.BASE_URL に変更
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

function hasPermission(requiredPermission) {
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  return userPermissions.includes(requiredPermission);
}

// ナビゲーションガード (認証チェック) の追加
router.beforeEach(async (to, from, next) => {
  const requiresAuth = Boolean(to.meta.requiresAuth);
  const accessToken = localStorage.getItem('accessToken');

  if (to.path.startsWith('/reset-password/')) {
    return next();
  }

  if (!requiresAuth) {
    if (accessToken && to.path === '/login') {
      return next('/home');
    }
    return next();
  }

  if (!accessToken) {
    localStorage.clear();
    return next('/login');
  }

  try {
    await axiosInstance.get('/api/auth/user/');
  } catch (error) {
    localStorage.clear();
    return next('/login');
  }

  if (to.meta.permission && !hasPermission(to.meta.permission)) {
    return next('/403');
  }

  next();
});

export default router;