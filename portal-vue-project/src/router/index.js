import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';

import LoginScreen from '../components/login/LoginScreen.vue';
import ForgotPasswordView from '../components/auth/ForgotPasswordView.vue';
import EmailSentView from '../components/auth/EmailSentView.vue';
import ResetPasswordConfirmView from '../components/auth/ResetPasswordConfirmView.vue';
import HomeView from '@/components/home/HomeView.vue';

import Forbidden403 from '@/components/error/Forbidden403.vue';
import NotFound404 from '@/components/error/NotFound404.vue';

import { authState } from '@/store/authState';
import { hasPermission } from '@/utils/permission';
import CalendarView from '../components/calendar/CalendarSection.vue'
// import NewsList from '../components/news/NewsList.vue'; // 例

const routes = [
  {
    path: '/login', // ログイン画面のURL
    name: 'Login',
    component: LoginScreen,
    meta: { requiresAuth: false } // 認証不要
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
    path: '/home', // ホーム画面のURL
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true } // 認証必要
  },
  {
    path: '/calendar',
    name: 'CalendarView',
    component: CalendarView,
    meta: { requiresAuth: true, title: 'スケジュールカレンダー' }
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
  if (!authState.authChecked) {
    const unwatch = watch(() => authState.authChecked, (val) => {
      if (val) {
        unwatch();
        next();
      }
    });
    return;
  }
  

  // 認証不要ページ
  if (to.meta.requiresAuth === false) {
    return next();
  }

  if (to.meta.requiresAuth && !authState.authenticated) {
    return next('/login');
  }

  if (to.meta.permission && !hasPermission(to.meta.permission)) {
    return next('/403');
  }

  next();
});

export default router;