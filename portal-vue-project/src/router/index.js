// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';

import LoginScreen from '@/components/login/LoginScreen.vue';
import HomeView from '@/components/home/HomeView.vue';

import NewsList from '@/components/newsList/NewsListScreen.vue';
import NewsDetailScreen from '@/components/newsList/NewsDetailScreen.vue';

import GalleryList from '@/components/gallery/GalleryListScreen.vue';
import GalleryDetail from '@/components/gallery/GalleryDetail.vue';
import GalleryCreate from '@/components/gallery/GalleryCreate.vue';
import GalleryEdit from '@/components/gallery/GalleryEdit.vue';

import TimeScheduleList from '@/components/timeSchedule/TimeScheduleList.vue';
import AddTimeScheduleScreen from '@/components/timeSchedule/addTimeSchedule/TimeScheduleScreen.vue';

import FileList from '@/components/file/FileList.vue';

import ForgotPasswordView from '@/components/auth/ForgotPasswordView.vue';
import EmailSentView from '@/components/auth/EmailSentView.vue';
import ResetPasswordConfirmView from '@/components/auth/ResetPasswordConfirmView.vue';

import CalendarView from '@/components/calendar/CalendarSection.vue';

import Forbidden403 from '@/components/error/Forbidden403.vue';
import NotFound404 from '@/components/error/NotFound404.vue';

import { authState } from '@/store/authState';
import { hasPermission } from '@/utils/permission';

const routes = [
  // --- Public ---
  {
    path: '/login',
    name: 'Login',
    component: LoginScreen,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { requiresAuth: false, title: 'パスワード再設定' },
  },
  {
    path: '/forgot-password/sent',
    name: 'EmailSent',
    component: EmailSentView,
    meta: { requiresAuth: false, title: 'メール送信完了' },
  },
  {
    path: '/reset-password/:uid/:token/:optionalSlash?',
    name: 'ResetPasswordConfirm',
    component: ResetPasswordConfirmView,
    meta: { requiresAuth: false, title: '新しいパスワードの設定' },
  },
  {
    path: '/403',
    name: 'Forbidden403',
    component: Forbidden403,
    meta: { requiresAuth: false },
  },

  // --- Private ---
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/files',
    name: 'FileList',
    component: FileList,
    meta: { requiresAuth: true },
  },

  // News
  {
    path: '/news',
    name: 'NewsList',
    component: NewsList,
    meta: { requiresAuth: true },
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: NewsDetailScreen,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/news/create',
    name: 'NewsCreate',
    component: () => import('@/components/newsList/addNews/AddNewsScreen.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/news/:id/edit',
    name: 'NewsEdit',
    component: () => import('@/components/newsList/editNews/EditNewsScreen.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // Gallery
  {
    path: '/gallery',
    name: 'GalleryList',
    component: GalleryList,
    meta: { requiresAuth: true },
  },
  {
    path: '/gallery/create',
    name: 'GalleryCreate',
    component: GalleryCreate,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/gallery/:id',
    name: 'GalleryDetail',
    component: GalleryDetail,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/gallery/:id/edit',
    name: 'GalleryEdit',
    component: GalleryEdit,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // TimeSchedule
  {
    path: '/timeschedules',
    name: 'TimeScheduleList',
    component: TimeScheduleList,
    meta: { requiresAuth: true },
  },
  {
    path: '/timeschedules/create',
    name: 'AddTimeSchedule',
    component: AddTimeScheduleScreen,
    meta: { requiresAuth: true, permission: 'timeschedule_manage' },
  },

  // Calendar
  {
    path: '/calendar',
    name: 'CalendarView',
    component: CalendarView,
    meta: { requiresAuth: true, title: 'スケジュールカレンダー' },
  },

  // Root / NotFound
  { path: '/', redirect: '/login' },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound404',
    component: NotFound404,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  // reset-password は常に許可（メールリンク等を想定）
  if (to.path?.startsWith('/reset-password/')) {
    return next();
  }

  // authState の初期チェック完了を待つ
  if (!authState.authChecked) {
    const unwatch = watch(
      () => authState.authChecked,
      (val) => {
        if (val) {
          unwatch();
          next();
        }
      }
    );
    return;
  }

  // 認証済みで Login へ来たら Home
  if (to.name === 'Login' && authState.authenticated) {
    return next({ name: 'Home' });
  }

  // 認証不要ページ
  if (to.meta.requiresAuth === false) {
    return next();
  }

  // 未ログイン
  if (to.meta.requiresAuth && !authState.authenticated) {
    return next({ name: 'Login' });
  }

  // 権限チェック（permission 正 / role は暫定）
  if (to.meta.permission && !hasPermission(to.meta.permission)) {
    return next({ name: 'Forbidden403' });
  }

  const requiresAdminRole = to.meta.isStaff || to.meta.requiresAdmin;
  if (requiresAdminRole) {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      return next({ name: 'Forbidden403' });
    }
  }

  return next();
});

export default router;
