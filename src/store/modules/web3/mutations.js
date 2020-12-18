import * as types from './mutation-types';
import { BPT_MEMBER } from '@lib/web3/contracts/enums';

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
  [types.UPDATE_RPC_URL](state, rpcUrl) {
    state.rpcUrl = rpcUrl;
  },
  [types.UPDATE_CHAIN_STATUS](state, chainStatus = {}) {
    state.chainStatus = Object.assign(state.chainStatus, chainStatus);
  },
  [types.UPDATE_GAS_STATE](state, gasState) {
    if (gasState) {
      state.gasState = Object.assign(state.gasState, gasState);
    }
  },
  [types.SET_CHAIN_TXS](state, chainTxs) {
    if (Array.isArray(chainTxs)) {
      state.chainTxs = Object.assign([], chainTxs);
    }
  },
  [types.ADD_UI_TX_STATE](state, txState) {
    if (typeof txState === 'object') {
      state.chainTxs = state.chainTxs.push(txState);
    }
  },
  [types.ADD_OR_UPDATE_UI_TX_STATE](state, txState = {}) {
    const { reqId, chainId } = txState;
    if (reqId && chainId) {
      if (!state.chainTxs || !state.chainTxs.length) {
        state.chainTxs = [];
      }
      let idx = state.chainTxs.findIndex((tx) => tx.reqId === reqId && tx.chainId === chainId);
      if (idx >= 0) {
        let old = state.chainTxs[idx];
        const newState = { ...old, ...txState };
        state.chainTxs.splice(idx, 1, newState);
      } else {
        state.chainTxs.push(txState);
      }
    }
  },
  [types.UPDATE_CHAIN_ALLOWANCE](state, chainAllowance) {
    if (typeof chainAllowance === 'object') {
      state.chainAllowance = Object.assign(state.chainAllowance, chainAllowance);
    }
  },
  [types.UPDATE_CHAIN_BT_ALLOWANCE](state, btAllowance) {
    const { selectedAddress } = state;

    if (btAllowance && selectedAddress) {
      let key = `${selectedAddress}_${BPT_MEMBER}`;
      if (typeof state.chainAllowance === 'object') {
        state.chainAllowance[key] = btAllowance;
      } else {
        state.chainAllowance = { [key]: btAllowance };
      }
    }
  },
};
