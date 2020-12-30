import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';
import { ETH_TOKEN, BT_TOKEN, BPT_MEMBER } from '@lib/web3/contracts/enums';
import { MEMBER_COSTWEI_PER_YEAR } from '@lib/web3/cnst.js';

export default {
  namespaced: true,
  actions,
  mutations,
  getters: {
    chainId: (state) => state.chainId,
    networks: (state) => state.networks.filter((n) => !n.disabled),
    selectedAddress: (state) => state.selectedAddress || '',
    gasState: (state) => state.gasState,
    chainTxs: (state) => state.chainTxs,
    rpcUrl: (state) => state.rpcUrl,
    ...getters,
  },
  state: {
    rpcUrl: '',
    chainId: 3,
    selectedAddress: '',
    networks: [
      {
        type: 'ropsten',
        nickname: 'Ropsten',
        chainId: 3,
        color: 'rgba(233, 21, 80, 0.7)',
      },
      {
        type: 'mainnet',
        nickname: 'Main Ethereum Network',
        chainId: 1,
        color: 'rgba(3, 135, 137, 0.7)',
      },
    ],
    chainBalances: {
      [ETH_TOKEN]: '0',
      [BT_TOKEN]: '0',
    },
    chainStatus: {
      memberCostWeiPerYear: MEMBER_COSTWEI_PER_YEAR,
      membershipDeadline: 0,
    },
    gasState: {
      gasLimit: 0,
      gasPrice: 0,
      safeLow: 0,
      fastest: 0,
    },
    chainTxs: [],
    chainAllowance: {
      [BPT_MEMBER]: 0,
    },
    lasttimestamp: 0,
  },
};
