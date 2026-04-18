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
