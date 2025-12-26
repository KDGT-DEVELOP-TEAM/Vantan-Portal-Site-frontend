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

import axiosInstance from '@/api/axiosInstance';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});


// ナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const accessToken = localStorage.getItem('accessToken');

  // reset-password は常に許可
  if (to.path.startsWith('/reset-password/')) {
    return next();
  }

  // 認証が不要なページ、またはログインページへアクセスしようとしているが既に認証済みの場合
  if (!requiresAuth) {
    if (accessToken && to.path === '/login') {
      return next('/home'); // ホームへリダイレクト
    }
    return next();
  }

  // --- ここから下は認証が必須なページ ---

  // トークンがない場合はログインページへ
  if (!accessToken) {
    localStorage.clear();
    return next('/login');
  }

  // トークンの有効性をサーバーで確認
  try {
    await axiosInstance.get('/api/auth/user/');
  } catch (error) {
    // トークンが無効ならクリアしてログインページへ
    localStorage.clear();
    return next('/login');
  }

  // --- ここから下は権限チェック ---

  // 仮実装: 新旧の権限判定ロジックを共存させる
  // TODO: 全てのルートが新しいpermissionベースに移行したら、古いroleベースの判定は削除する
  
  const userRole = localStorage.getItem('userRole');

  /**
   * 新しいパーミッションベースの権限チェック
   * @param {string} requiredPermission - ルートのmetaで要求される権限
   * @returns {boolean} - 権限があればtrue
   */
  function hasPermission(requiredPermission) {
    if (!requiredPermission) return true; // 権限が指定されていなければチェック不要
    const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    return userPermissions.includes(requiredPermission);
  }

  // 1. 新しい'permission'メタフィールドがあれば、それを優先してチェック
  if (to.meta.permission) {
    if (hasPermission(to.meta.permission)) {
      return next(); // 権限OK
    } else {
      console.warn(`Provisional Auth: Permission '${to.meta.permission}' is required.`);
      return next('/403'); // 権限NG
    }
  }

  // 2. 'permission'がなければ、古い'requiresAdmin' or 'isStaff'をフォールバックとしてチェック
  const requiresAdminRole = to.meta.isStaff || to.meta.requiresAdmin;
  if (requiresAdminRole) {
    if (userRole === 'admin') {
      return next(); // ロールOK
    } else {
      console.warn(`Provisional Auth: Admin role is required.`);
      return next('/403'); // ロールNG
    }
  }
  // END: 仮実装ここまで

  // ルートに権限の指定がなければアクセスを許可
  next();
});

export default router;