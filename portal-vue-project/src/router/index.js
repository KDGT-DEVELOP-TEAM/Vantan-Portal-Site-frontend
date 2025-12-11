import { createRouter, createWebHistory } from 'vue-router';
import LoginScreen from '../components/login/LoginScreen.vue';
import ForgotPasswordView from '../components/auth/ForgotPasswordView.vue';
import EmailSentView from '../components/auth/EmailSentView.vue';
import ResetPasswordConfirmView from '../components/auth/ResetPasswordConfirmView.vue';
import HomeView from '../components/home/HomeView.vue';
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
    path: '/',
    name: 'Root',
    component: LoginScreen,
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
  //  修正箇所: process.env.BASE_URL を import.meta.env.BASE_URL に変更
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = localStorage.getItem('accessToken')

  // reset-password ページは常に通す（認証不要）
  if (to.path.startsWith('/reset-password/')) {
    return next()
  }
  

  // 認証が必要でトークンが無い → ログインへ
  else if (requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // ログイン済みでログインページへ行く → home へ
  if (isAuthenticated && to.path === '/login') {
    return next('/home')
  }

  // 通常遷移
  next()
})


export default router;