// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';

import LoginScreen from '@/components/login/LoginScreen.vue';
import EmailSentView from '@/components/auth/EmailSentView.vue';
import ResetPasswordConfirmView from '@/components/auth/ResetPasswordConfirmView.vue';
import ForgotPasswordView from '@/components/auth/ForgotPasswordView.vue';
import HomeView from '@/components/home/HomeView.vue';
import UserList from '@/components/userManagement/UserList.vue';

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
    path: '/forgot-password/sent', // メール送信完了
    name: 'EmailSent',
    component: EmailSentView,
    meta: { requiresAuth: false, title: 'メール送信完了' } // 認証不要
  },
  {
    // パスワード再設定フォーム (メールのURLから遷移。uidとtokenをパラメータとして受け取る)
    path: '/reset-password/:uid/:token/:optionalSlash?',
    name: 'ResetPasswordConfirm',
    component: ResetPasswordConfirmView,
    meta: { requiresAuth: false, title: '新しいパスワードの設定' } // 認証不要
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'UserList',
    component: UserList,
    meta: {
      requiresAuth: true,
      permission: 'user_manage',
    },
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
  
  if (to.name === 'Login' && authState.authenticated) {
    return next({ name: 'Home' });
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