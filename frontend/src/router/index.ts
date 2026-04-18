import { createRouter, createWebHistory } from 'vue-router';
import { useAuth, waitForAuthReady } from '../composables/useAuth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
      meta: {
        titleKey: 'titles.home',
      },
    },
    {
      path: '/checkin/:pumpId',
      name: 'checkin',
      component: () => import('../pages/CheckinPage.vue'),
      meta: {
        titleKey: 'titles.checkin',
        requiresAuth: true,
      },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../pages/AuthPage.vue'),
      meta: {
        titleKey: 'titles.auth',
      },
    },
  ],
});

router.beforeEach(async (to) => {
  await waitForAuthReady();

  const { currentUser } = useAuth();
  const requiresAuth = (to.meta as { requiresAuth?: boolean }).requiresAuth === true;

  if (requiresAuth && !currentUser.value) {
    return {
      name: 'auth',
      query: { redirect: to.fullPath },
    };
  }

  if (to.name === 'auth' && currentUser.value) {
    const redirect =
      typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/')
        ? to.query.redirect
        : '/';
    return redirect;
  }

  return true;
});

export default router;
