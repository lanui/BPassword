import { ETH_TOKEN, BT_TOKEN } from '@lib/web3/contracts/enums';

import { wei2Ether, wei2Diamonds, compareWei } from '@lib/web3/web3-helpers';

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

export const estimateBts = (state) => {
  const { chainStatus = {}, chainBalances = {} } = state;
  const ethWei = chainBalances[ETH_TOKEN];
  if (!ethWei || ethWei == '0') return false;

  const btsWei = chainBalances[BT_TOKEN] || 0;
  const memberCostWeiPerYear = chainStatus.memberCostWeiPerYear || 0;

  if (compareWei(btsWei, memberCostWeiPerYear) < 0) {
    return false;
  }
  return true;
};

export const currentAllowance = (state) => {
  const { chainBalances } = state;
  const allowance2bptMember = chainBalances.allowance;
  let allowanceWei = '0';
  if (typeof allowance2bptMember === 'object' && Object.values(allowance2bptMember).length) {
    allowanceWei = Object.values(allowance2bptMember)[0];
  }

  return allowanceWei;
};

/**
 *
 * @param {} state
 */
export const validNeedApprove = (state) => {
  const { chainStatus } = state;
  const memberCostWeiPerYear = chainStatus.memberCostWeiPerYear || 0;
  const allowanceWei = currentAllowance(state);

  //TODO remove
  return true;

  return compareWei(allowanceWei, memberCostWeiPerYear) < 0;
};
