export const currentNetwork = (state) => {
  const currentChainId = state.chainId;
  return state.networks.find((nw) => nw.chainId === currentChainId) || state.networks[0];
};
