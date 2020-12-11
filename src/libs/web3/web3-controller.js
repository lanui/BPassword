import EventEmitter from 'events';
import ObservableStore from 'obs-store';

import { ROPSTEN, NETWORK_TYPE_NAME_KV } from '../network/enums';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-09
 *    @comments:
 **********************************************************************/
const StateStruct = {
  tokens: {}, // address:{symbol,chainId,lasttime,balance}
};
class Web3Controller extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.getCurrentProvider = opts.getCurrentProvider;
    const initState = opts.initState || _initStateStruct();

    this.store = new ObservableStore(initState);

    this.on('reloadBalances', this.reloadBalances.bind(this));
  }

  reloadBalances() {}
}

/**
 *
 */
function _initStateStruct() {
  return {
    tokens: {},
    txs: [],
  };
}

export default Web3Controller;
