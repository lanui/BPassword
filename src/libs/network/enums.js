export const ROPSTEN = 'ropsten';
export const RINKEBY = 'rinkeby';
export const KOVAN = 'kovan';
export const MAINNET = 'mainnet';
export const GOERLI = 'goerli';
export const LOCALHOST = 'localhost';

export const MAINNET_NETWORK_ID = '1';
export const ROPSTEN_NETWORK_ID = '3';
export const RINKEBY_NETWORK_ID = '4';
export const GOERLI_NETWORK_ID = '5';
export const KOVAN_NETWORK_ID = '42';

export const MAINNET_CHAIN_ID = '0x1';
export const ROPSTEN_CHAIN_ID = '0x3';
export const RINKEBY_CHAIN_ID = '0x4';
export const GOERLI_CHAIN_ID = '0x5';
export const KOVAN_CHAIN_ID = '0x2a';

export const ROPSTEN_DISPLAY_NAME = 'Ropsten';
export const RINKEBY_DISPLAY_NAME = 'Rinkeby';
export const KOVAN_DISPLAY_NAME = 'Kovan';
export const MAINNET_DISPLAY_NAME = 'Main Ethereum Network';
export const GOERLI_DISPLAY_NAME = 'Goerli';

export const INFURA_PROVIDER_TYPES = [ROPSTEN_DISPLAY_NAME, MAINNET_DISPLAY_NAME];

export const NETWORK_TYPE_NAME_KV = {
  [ROPSTEN]: {
    networkId: ROPSTEN_NETWORK_ID,
    chainId: ROPSTEN_CHAIN_ID,
    text: ROPSTEN_DISPLAY_NAME,
  },
  [MAINNET]: {
    networkId: MAINNET_NETWORK_ID,
    chainId: MAINNET_CHAIN_ID,
    text: MAINNET_DISPLAY_NAME,
  },
};
