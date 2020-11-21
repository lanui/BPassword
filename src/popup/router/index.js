import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
import store from '@/store';

Vue.use(VueRouter);
const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return VueRouterPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes,
});

router.beforeEach(async (to, form, next) => {
  let env3 = await store.getters['env3'];
  if (!env3) {
    await store.dispatch('loadEnv3FromLocale');
    env3 = await store.getters['env3'];
  }
  if (to.matched.some((rec) => rec.meta.auth)) {
    const isUnlocked = store.getters['isUnlocked'];

    if (!env3 || !isUnlocked) {
      // next();
      if (!!env3) {
        next({
          path: '/signin',
          query: { redirect: to.fullPath },
        });
      } else {
        next({
          path: '/welcome',
          query: { redirect: to.fullPath },
        });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
