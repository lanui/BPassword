export const EXTERNAL_PAGES = {
  helpDuide: 'https://lanui.github.io/BPassword/#/zh_cn/user_guide',
};

export const compressAddress = (address) => {
  if (address === undefined) return '';
  if (typeof address === 'object' || typeof address === 'function')
    throw new Error('addres type error.');
  address = '' + address;
  if (!address || address.length < 12) return address;

  const len = address.length;
  const ret = address.substr(0, 6) + '...' + address.substr(len - 4);

  return ret;
};

export const blockexplorerUrl = (hash) => {
  return `https://blockexplorer.one/eth/ropsten/address/${hash}`;
};
