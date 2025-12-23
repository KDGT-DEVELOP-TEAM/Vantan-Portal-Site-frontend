import { createRouter, createWebHistory } from 'vue-router';
import LoginScreen from '../components/login/LoginScreen.vue';
import HomeView from '../components/home/HomeView.vue';
import NewsList from '../components/newsList/NewsListScreen.vue';
import NewsDetailScreen from '../components/newsList/NewsDetailScreen.vue';
import GalleryList from '../components/gallery/GalleryListScreen.vue';
import GalleryDetail from '../components/gallery/GalleryDetail.vue';
import GalleryCreate from '../components/gallery/GalleryCreate.vue';
import GalleryEdit from '../components/gallery/GalleryEdit.vue';
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
    redirect: '/login' // root URL にアクセスした場合に /login に転送
  },
  {
    path: '/news', // お知らせ一覧のURL
    name: 'NewsList',
    component: NewsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/news/:id', 
    name: 'NewsDetail', // ルート名
    component: NewsDetailScreen, // 使用するコンポーネント
    props: true, // コンポーネントにURLのパラメーターをpropsとして渡す設定
  },
  {
    path: '/news/create',
    name: 'NewsCreate',
    component: () => import('../components/newsList/addNews/AddNewsScreen.vue'), 
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/news/:id/edit',
    name: 'NewsEdit',
    component: () => import('../components/newsList/editNews/EditNewsScreen.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/gallery',
    name: 'GalleryList',
    component: GalleryList,
    meta: { requiresAuth: true }
  },
  {
    path: '/gallery/create',
    name: 'GalleryCreate',
    component: GalleryCreate,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/gallery/:id',
    name: 'GalleryDetail',
    component: GalleryDetail, 
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/gallery/:id/edit',
    name: 'GalleryEdit',
    component: GalleryEdit,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
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