import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';
import { ETH_TOKEN, BT_TOKEN } from '@lib/web3/contracts/enums';

export default {
  namespaced: true,
  actions,
  mutations,
  getters: {
    chainId: (state) => state.chainId,
    networks: (state) => state.networks.filter((n) => !n.disabled),
    selectedAddress: (state) => state.selectedAddress || '',
    ...getters,
  },
  state: {
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
    lasttimestamp: 0,
  },
};
