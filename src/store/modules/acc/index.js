import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

/*********************************************************************
 * AircraftClass ::
 *    @description: move balance to web3 controller
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-14
 *    @comments:
 **********************************************************************/
/**
 * @deprecated ethBalance
 * @deprecated btsBalance
 */
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
