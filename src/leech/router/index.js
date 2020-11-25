import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';
import store from '../store';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((rec) => rec.meta.auth)) {
    const isUnlocked = store.getters['isUnlocked'];
    // console.log('&&&&&&&&&&&&&&>', isUnlocked);
    if (!isUnlocked) {
      // next({
      //   path: '/guest',
      //   query: { redirect: to.fullPath },
      // });
      next();
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
