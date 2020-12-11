import * as types from './mutation-types';

/**
 *
 * @param {*} param0
 * @param {*} networkState
 */
export const subInitNetworkState = async ({ commit }, networkState) => {
  if (networkState) {
    const { chainId, networks, networkType, enabledCustomize } = networkState;
    commit(types.UPDATE_NETWORK_LIST, networks);
    commit(types.UPDATE_CHAINID, chainId);
  }
};

export const updateCurrentNetwork = async ({ commit }, chainId) => {
  //TODO send to backend

  commit(types.UPDATE_CHAINID, chainId);
};

/**
 *
 * @param {*} param0
 * @param {Object} initState from received backaground AccountController
 */
export const subInitState = async ({ commit }, { selectedAddress }) => {
  commit(types.UPDATE_SELECTED_ADDRESS, selectedAddress);
};
