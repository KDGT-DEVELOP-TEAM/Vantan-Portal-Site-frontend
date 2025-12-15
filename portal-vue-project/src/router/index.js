import { createRouter, createWebHistory } from 'vue-router';
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
    meta: { requiresAuth: true, title: '時間割リスト' }
  },
  {
    path: '/timeschedules/create', 
    name: 'AddTimeSchedule',
    component: AddTimeScheduleScreen, // 新規作成画面コンポーネント
    meta: { requiresAuth: true, isStaff: true, title: '時間割作成' } // 管理者のみ許可
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
  routes
});


// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = localStorage.getItem('accessToken')
  const userRole = localStorage.getItem('userRole')

  // reset-password は常にOK
  if (to.path.startsWith('/reset-password/')) {
    return next()
  }

  // 未ログインで認証必須
  if (requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // 管理者限定チェック
  if (to.meta.isStaff && userRole !== 'admin') {
    return next('/403')
  }

  // ログイン済みで login に行こうとした
  if (isAuthenticated && to.path === '/login') {
    return next('/home')
  }

  next()
})


export default router;