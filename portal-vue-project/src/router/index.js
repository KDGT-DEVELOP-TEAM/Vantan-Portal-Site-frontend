// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

import LoginScreen from '@/components/login/LoginScreen.vue';
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