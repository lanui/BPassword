import MainLayout from '../layouts/MainLayout.vue';
import HomeIndex from '../views/HomeIndex.vue';
import LeechGuest from '../views/LeechGuest.vue';
import AddPassItem from '../views/AddPassItem';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'index',
        alias: '/',
        component: HomeIndex,
        meta: { auth: true },
      },
      {
        path: 'add_passbook',
        component: AddPassItem,
        meta: { auth: true },
      },
    ],
    meta: { auth: true },
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'guest',
        alias: '/guest',
        component: LeechGuest,
        meta: {},
      },
    ],
    meta: {},
  },
];

export default routes;
