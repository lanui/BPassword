import { fromWei } from 'web3-utils';

export const ethBalText = (state) => {
  const bal = state.ethBalance || '0.00';
  return parseFloat(fromWei(bal.toString(), 'ether')).toFixed(4);
};

export const diamondsBalText = (state) => {
  // return '3123.00';
  const bal = state.ethBalance || 0;
  return (parseFloat(fromWei(bal.toString(), 'ether')) * 10000).toFixed(2);
};

export const btsBalText = (state) => {
  const bal = state.btsBalance || 0;
  return bal ? parseFloat(bal.toString()).toFixed(2) : '0.00';
};
