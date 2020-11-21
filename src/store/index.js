import Vue from 'vue';
import Vuex from 'vuex';

import * as getters from './getters';
import mutations from './mutations';
import * as actions from './actions';

import { DEFAULT_LOCALE, DEFAULT_CHAIN_ID } from '@/ui/settings';

//modules
import acc from './modules/acc';
import ui from './modules/ui';
import web3 from './modules/web3';
import opt from './modules/options';
import passbook from './modules/passbook';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    acc,
    ui,
    opt,
    passbook,
    web3,
  },
  actions,
  mutations,
  getters: {
    env3: (state) => state.env3 || null,
    locale: (state) => state.locale,
    isUnlocked: (state) => Boolean(state.isUnlocked),
    ...getters,
  },
  state: {
    locale: DEFAULT_LOCALE,
    chainId: DEFAULT_CHAIN_ID,
    env3: null,
    isUnlocked: false,
  },
});

export default store;
