import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

export default {
  namespaced: true,
  actions,
  mutations,
  getters: {
    ethBalance: (state) => state.ethBalance,
    btsBalance: (state) => state.btsBalance,
    ...getters,
  },
  state: {
    ethBalance: null,
    btsBalance: null,
  },
};
