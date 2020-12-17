export const ROPSTEN = 'ropsten';
export const RINKEBY = 'rinkeby';
export const KOVAN = 'kovan';
export const MAINNET = 'mainnet';
export const GOERLI = 'goerli';
export const LOCALHOST = 'localhost';
export const CUSTOM_DEFAULT = 'private';

export const MAINNET_NETWORK_ID = '1';
export const ROPSTEN_NETWORK_ID = '3';
export const RINKEBY_NETWORK_ID = '4';
export const GOERLI_NETWORK_ID = '5';
export const KOVAN_NETWORK_ID = '42';

export const MAINNET_CHAIN_ID = 0x1;
export const ROPSTEN_CHAIN_ID = 0x3;
export const RINKEBY_CHAIN_ID = 0x4;
export const GOERLI_CHAIN_ID = 0x5;
export const KOVAN_CHAIN_ID = 0x2a;

export const ROPSTEN_DISPLAY_NAME = 'Ropsten';
export const RINKEBY_DISPLAY_NAME = 'Rinkeby';
export const KOVAN_DISPLAY_NAME = 'Kovan';
export const MAINNET_DISPLAY_NAME = 'Main Ethereum';
export const GOERLI_DISPLAY_NAME = 'Goerli';

export const INFURA_PROVIDER_TYPES = [ROPSTEN_DISPLAY_NAME, MAINNET_DISPLAY_NAME];

export const NETWORK_TYPE_NAME_KV = {
  [MAINNET]: {
    type: MAINNET,
    networkId: MAINNET_NETWORK_ID,
    chainId: MAINNET_CHAIN_ID,
    nickname: MAINNET_DISPLAY_NAME,
    color: 'rgba(3, 135, 137, 0.7)',
    disabled: false,
  },
  [ROPSTEN]: {
    type: ROPSTEN,
    networkId: ROPSTEN_NETWORK_ID,
    chainId: ROPSTEN_CHAIN_ID,
    nickname: ROPSTEN_DISPLAY_NAME,
    color: 'rgba(233, 21, 80, 0.7)',
  },
};

export const PROVIDER_TYPE_CUSTOM = 'costomize';
export const PROVIDER_TYPE_INFURA = 'infura';

/**
 *
 * @param {number|hex} chainId
 * @returns {object} [type,networkId,chainId,text]
 */
export function findNetworkByChainId(chainId) {
  return Object.values(NETWORK_TYPE_NAME_KV).find((n) => parseInt(n.chainId) === parseInt(chainId));
}

export const DEFAULT_HARDFORK = 'byzantium';
export const SUPPORT_HARDFORKS = ['byzantium', 'istanbul', 'petersburg', 'muirGlacier'];
