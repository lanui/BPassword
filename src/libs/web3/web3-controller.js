import EventEmitter from 'events';
import ObservableStore from 'obs-store';

import { ROPSTEN, NETWORK_TYPE_NAME_KV } from '../network/enums';
import CustomSmartJson from './contracts/custom_address.json';

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

    if (!opts.initState) {
      this.store.updateState(initState);
    }
  }

  reloadBalances() {}
}

/**
 *
 */
function _initStateStruct() {
  const initState = {
    tokens: {},
    txs: [],
    smarts: {},
  };

  let smarts = {
    1: [],
    3: [],
  };
  if (typeof CustomSmartJson === 'object' && Object.values(CustomSmartJson).length === 1) {
    const keyString = Object.keys(CustomSmartJson)[0];
    const smartsValts = CustomSmartJson[keyString] || [];
    smarts[parseInt(keyString)] = smartsValts;

    for (let i in smartsValts) {
      const smart = smartsValts[i];
      const skey = Object.keys(smart)[0];
      const newSmart = { [skey]: '' };
      smarts[1].push(newSmart);
      smarts[3].push(newSmart);
    }
  }

  initState.smarts = smarts;

  return initState;
}

export default Web3Controller;
