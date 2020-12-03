import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import * as getters from './getters';
import mutations from './mutations';

Vue.use(Vuex);
const maxRows = 6;
const itemHeight = 40;
const store = new Vuex.Store({
  actions,
  mutations,
  getters: {
    showColse: (state) => Boolean(state.settings.showClose),
    isUnlocked: (state) => state.isUnlocked,
    itemHeight: (state) => state.settings.itemHeight,
    hostname: (state) => state.hostname,
    isAddor: (state) => state.viewPath === 'addor',
    valtState: (state) => state.valtState,
    ...getters,
  },
  state: {
    items: [],
    isUnlocked: false,
    feildVolume: {
      username: 'jack',
      password: '',
    },
    trash: [],
    hostname: '',
    settings: {
      showClose: false,
      itemHeight: itemHeight,
      maxRows: maxRows,
    },
    viewPath: 'index',
    valtState: {
      activedField: '',
      ctype: '',
      hostname: '',
      password: '',
      username: '',
    },
  },
});

export default store;
