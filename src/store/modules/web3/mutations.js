import * as types from './mutation-types';

export default {
  [types.UPDATE_CHAINID](state, chainId) {
    state.chainId = chainId;
  },
  [types.UPDATE_SELECTED_ADDRESS](state, selectedAddress) {
    state.selectedAddress = selectedAddress;
  },
  [types.UPDATE_NETWORK_LIST](state, networks) {
    if (networks && networks.length) {
      state.networks = networks;
    }
  },
  [types.UPDATE_CHAIN_BALANCES](state, chainBalances = {}) {
    state.chainBalances = Object.assign(state.chainBalances, chainBalances);
  },
  [types.UPDATE_LASTTIMESATMP](state, ts = 0) {
    state.lasttimestamp = ts;
  },
  [types.UPDATE_CHAIN_STATUS](state, chainStatus = {}) {
    state.chainStatus = Object.assign(state.chainStatus, chainStatus);
  },
  [types.UPDATE_GAS_STATE](state, gasState) {
    if (gasState) {
      state.gasState = Object.assign(state.gasState, gasState);
    }
  },
};
