// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';

import LoginScreen from '@/components/login/LoginScreen.vue';
import HomeView from '@/components/home/HomeView.vue';
import FileList from '@/components/file/FileList.vue';
import ForgotPasswordView from '@/components/auth/ForgotPasswordView.vue';

import Forbidden403 from '@/components/error/Forbidden403.vue';
import NotFound404 from '@/components/error/NotFound404.vue';

import { authState } from '@/store/authState';
import { hasPermission } from '@/utils/permission';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginScreen,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password', // パスワードリセット要求 (メールアドレス入力)
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { requiresAuth: false, title: 'パスワード再設定' } // 認証不要
  },
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
  {
    path: '/403',
    name: 'Forbidden403',
    component: Forbidden403,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound404',
    component: NotFound404,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
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

  // 認証不要ページ
  if (to.meta.requiresAuth === false) {
    return next();
  }

  // 未ログイン
  if (to.meta.requiresAuth && !authState.authenticated) {
    return next('/login');
  }

  // 権限チェック
  if (to.meta.permission && !hasPermission(to.meta.permission)) {
    return next('/403');
  }

  next();
});

export default router;
