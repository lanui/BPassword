import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

export default {
  namespaced: true,
  actions,
  mutations,
  getters: {
    chainId: (state) => state.chainId,
    networks: (state) => state.networks,
    selectedAddress: (state) => state.selectedAddress || '',
    ...getters,
  },
  state: {
    chainId: 3,
    selectedAddress: '',
    selectedSubKey: '',
    networks: [
      {
        text: 'Ropsten',
        chainId: 3,
        color: 'rgba(233, 21, 80, 0.7)',
      },
      {
        text: 'Mainnet',
        chainId: 1,
        color: 'rgba(3, 135, 137, 0.7)',
      },
    ],
  },
};
