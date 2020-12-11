import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import ComposedStore from 'obs-store/lib/composed';
import logger from '../logger';

import {
  CUSTOM_DEFAULT,
  ROPSTEN,
  ROPSTEN_CHAIN_ID,
  NETWORK_TYPE_NAME_KV,
  PROVIDER_TYPE_CUSTOM,
  PROVIDER_TYPE_INFURA,
  findNetworkByChainId,
} from './enums';
import { buildTSLRpcURL } from './infura-helper';
import Web3, { providers } from 'web3';
import { LOG_LEVEL } from '@lib/code-settings';
import BizError from '@lib/biz-error';
import { NETWORK_UNAVAILABLE, NETWORK_TIMEOUT } from '@lib/biz-error/error-codes';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description: https://mainnet.infura.io/v3/YOUR-PROJECT-ID
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-09
 *    @comments:
 **********************************************************************/
const DEFAULT_PROVIDER = {
  providerType: PROVIDER_TYPE_CUSTOM,
  type: CUSTOM_DEFAULT,
  rpcUrl: 'http://localhost:7545',
  chainId: 0x1691,
  nickname: 'Custom 7545',
  color: 'rgba(111, 160, 239,.9)',
};

const DEF_ENABLED_CUSTOMIZE = LOG_LEVEL === 'DEBUG' ? true : false;
class NetworkController extends EventEmitter {
  constructor(opts = {}) {
    super();
    const initState = opts.initState || {};
    let {
      provider,
      custom = DEFAULT_PROVIDER,
      enabledCustomize = DEF_ENABLED_CUSTOMIZE,
    } = initState;
    if (!provider) {
      provider = buildDefaultCurrentProvider();
    }

    this.customzieStore = new ObservableStore(enabledCustomize);
    this.customStore = new ObservableStore(custom);
    this.providerStore = new ObservableStore(provider);

    /**
     * networkStore mark network status
     * loading,ropsten,mainnet,private[custom]
     */
    this.networkStore = new ObservableStore('loading');
    this.store = new ComposedStore({
      enabledCustomize: this.customzieStore,
      provider: this.providerStore,
      custom: this.customStore,
      network: this.networkStore,
    });

    setTimeout(async () => {
      // this.pingNetwork();
    }, 1000);
  }

  async changedNetwork(network) {
    logger.debug(`WhisperListener Received Data>>>`, network);
    if (typeof network !== 'object') {
      throw new BizError('Network Params illegal.');
    }
    const { chainId, nickname, providerType } = network;
    let _provider;
    if (providerType === PROVIDER_TYPE_CUSTOM) {
      _provider = this.customStore.getState();
      logger.debug(`WhisperListener Received Data>>>`, _provider);
      if (_provider) {
        _provider.providerType = PROVIDER_TYPE_CUSTOM;
      }
    } else if (providerType === PROVIDER_TYPE_INFURA) {
      const nw = findNetworkByChainId(chainId);
      if (nw) {
        _provider = {
          ...nw,
          providerType: PROVIDER_TYPE_INFURA,
          rpcUrl: buildTSLRpcURL({ network: nw.type }),
        };
      }
    }

    if (!_provider || !_provider.rpcUrl) {
      throw new BizError(`Unsupport network:${nickname}`, NETWORK_UNAVAILABLE);
    }

    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(_provider.rpcUrl));
      const chainId = await web3.eth.net.getId();
      const networkType = await web3.eth.net.getNetworkType();
      _provider.chainId = chainId;
      _provider.type = networkType;
      this.providerStore.updateState(_provider);
      this.networkStore.putState(networkType);

      return this.getSendState();
    } catch (err) {
      logger.warn('Ping network failed', err.message);
      throw new BizError(err.message, NETWORK_TIMEOUT);
    }
  }

  /**
   * notation: don't send state
   */
  getSendState() {
    const { enabledCustomize, provider } = this.store.getState();
    let networks = [];
    networks = networks.concat(Object.values(NETWORK_TYPE_NAME_KV));
    if (enabledCustomize) {
      const custom = this.customStore.getState();
      networks = networks.concat(custom);
    }

    networks = networks.map((n) => {
      const id = `${n.providerType || PROVIDER_TYPE_INFURA}-${n.chainId}`;

      return {
        id,
        providerType: n.providerType || PROVIDER_TYPE_INFURA,
        type: n.type,
        nickname: n.nickname,
        chainId: n.chainId,
        color: n.color,
      };
    });

    const sendState = {
      chainId: provider?.chainId || ROPSTEN_CHAIN_ID,
      enabledCustomize,
      networkType: provider?.type,
      networks,
    };

    return sendState;
  }

  getCurrentProvider() {
    const { provider, network, custom } = this.store.getState();
    if (!network || (!NETWORK_TYPE_NAME_KV[network] && network !== custom.type)) {
      throw new BizError(`Current provider ${provider?.type || network} disconnect.`);
    }
    return provider;
  }

  async pingNetwork() {
    try {
      const { provider } = this.store.getState();
      if (!provider || !provider.rpcUrl) {
        throw 'no provider in store.';
      }
      const web3 = new Web3(new Web3.providers.HttpProvider(provider.rpcUrl));
      const chainId = await web3.eth.net.getId();
      const networkType = await web3.eth.net.getNetworkType();
      logger.debug('Ping>>>>>>', chainId, networkType);
      this.providerStore.updateState({ type: networkType });
      this.networkStore.putState(networkType);
    } catch (error) {
      logger.warn('Ping network fail.', error.message);
    }
  }
  /*------------------------------  private methods ---------------------------------- */
}

function buildDefaultCurrentProvider() {
  const rpcUrl = buildTSLRpcURL({ network: ROPSTEN });
  const ropstenNetwork = NETWORK_TYPE_NAME_KV[ROPSTEN];

  return {
    providerType: PROVIDER_TYPE_INFURA,
    ...ropstenNetwork,
    rpcUrl,
  };
}
export default NetworkController;
