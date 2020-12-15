import { ETH_TOKEN, BT_TOKEN } from '@lib/web3/contracts/enums';

import { wei2Ether, wei2Diamonds } from '@lib/web3/web3-helpers';

import moment from 'moment';

const diffHours = 0.5;

export const currentNetwork = (state) => {
  const currentChainId = state.chainId;
  return state.networks.find((nw) => nw.chainId === currentChainId) || state.networks[0];
};

export const getEthBalanceText = (state) => {
  const { chainBalances = {} } = state;
  let ethWei = chainBalances[ETH_TOKEN] || '0';

  return wei2Ether(ethWei, 2);
};

export const getDiamondsText = (state) => {
  const { chainBalances = {} } = state;
  let ethWei = chainBalances[ETH_TOKEN] || '0';

  return wei2Diamonds(ethWei, 2);
};

export const getBTsBalanceText = (state) => {
  const { chainBalances = {} } = state;
  let ethWei = chainBalances[BT_TOKEN] || '0';

  return wei2Ether(ethWei, 2);
};

export const balanceExpired = (state) => {
  const currTs = new Date().getTime();
  const lasttimestamp = state.lasttimestamp;

  const diff = (currTs - lasttimestamp) / (1000 * 60 * 60);

  return diff >= diffHours;
};

export const getMembershipExpired = (state) => {
  const { chainStatus = {} } = state;
  const expired = chainStatus.membershipDeadline;
  if (!expired || expired === '0' || expired < 0) return '';
  const text = moment(new Date(expired)).format('YYYY-MM-DD');
  return text;
};

export const membershipCostBTsPerYear = (state) => {
  const { chainStatus = {} } = state;
  const wei = chainStatus.memberCostWeiPerYear;
  if (!wei) return '';
  return wei2Ether(wei, 0);
};
