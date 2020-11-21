import * as types from './mutation-types';

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
