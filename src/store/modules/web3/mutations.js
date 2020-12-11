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
};
