import { createRouter, createWebHistory } from 'vue-router';

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
  ],
});

export default router;
