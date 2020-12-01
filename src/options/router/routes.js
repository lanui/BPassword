import HomeIndex from '../views/HomeIndex.vue';
import BaseOptions from '../views/BaseOptions.vue';

const routes = [
  {
    path: '/home',
    alias: '/',
    component: HomeIndex,
  },
  {
    path: '/base',
    component: BaseOptions,
  },
];

export default routes;
