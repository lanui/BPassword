import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
import store from '@/store';

import WhispererController from '@lib/messages/whisperer-controller';
import { API_RT_RELOAD_CHAIN_BALANCES } from '@lib/msgapi/api-types';

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
      //
      let refreshBalance = false;
      refreshBalance = !!(to && to.meta && to.meta.refreshBalance && isUnlocked);
      if (refreshBalance) {
        console.log('>>>>>>>>>>>>>>>>should refresh balances>>', refreshBalance, to?.fullPath);

        const whisperer = new WhispererController({ portName: 'router-reload-balance' });
        const data = { from: `router:${to.path}` };
        whisperer
          .sendSimpleMessage(API_RT_RELOAD_CHAIN_BALANCES, data)
          .then(async (web3State) => {
            console.log(web3State);
            if (web3State) {
              await store.dispatch('web3/subInitWeb3State', web3State);
            }
          })
          .catch((err) => {
            console.warn(err.message);
          });
      }
      next();
    }
  } else {
    next();
  }
});

export default router;
