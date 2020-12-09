import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import ComposedStore from 'obs-store/lib/composed';
import logger from '../logger';

import { CUSTOM, ROPSTEN, NETWORK_TYPE_NAME_KV } from './enums';
import { buildTSLRpcURL } from './infura-helper';
import { providers } from 'web3';

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
  networkType: ROPSTEN,
  rpcUrl: 'http://localhost:7545',
  chainId: '0x539',
  nickname: 'Localhost 7545',
};
class NetworkController extends EventEmitter {
  constructor(opts = {}) {
    super();
    const initState = opts.initState || {};
    const { provider = DEFAULT_PROVIDER } = initState;
    this.providerStore = new ObservableStore(provider);
    this.networkStore = new ObservableStore('loading');
    this.store = new ComposedStore({
      provider: this.providerStore,
      network: this.networkStore,
    });

    this.on('network:changed', this.lookupNetwork);

    this.lookupNetwork();
  }

  lookupNetwork() {
    const { provider = {} } = this.store.getState();

    const { networkType, rpcUrl, infuraId, infuraSecret } = provider;
    if (typeof networkType !== 'string') {
      logger.warn('provider init error.');
      return;
    }

    let _rpcUrl;
    if (NETWORK_TYPE_NAME_KV[networkType]) {
      let params = {
        network: networkType,
        projectId: infuraId || undefined,
        secretKey: infuraSecret || undefined,
      };

      _rpcUrl = buildTSLRpcURL(params);
      logger.debug('NetworkController >>>>>>>>', _rpcUrl);
    } else if (networkType === CUSTOM && rpcUrl) {
      _rpcUrl = rpcUrl;
    } else {
      logger.warn('unsupport network type [' + networkType + ']. or miss rpcUrl.' + rpcUrl);
      return;
    }

    if (!this._provider) {
      this._provider = new providers.HttpProvider(_rpcUrl);
      const web3 = new Web3(this._provider);

      web3.eth.net
        .getId()
        .then((id) => {
          this.providerStore.updateState({ chainId: id });
          this.networkStore.putState(network);
        })
        .catch((err) => {
          logger.warn('web3 eth getId', err.message);
          this.networkStore.putState('loading');
        });
    }
  }
}

export default NetworkController;
