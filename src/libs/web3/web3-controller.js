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
  network: ROPSTEN,
};
class Web3Controller extends EventEmitter {
  constructor(opts = {}) {
    super();

    const initState = opts.initState || {
      network: ROPSTEN,
    };

    this.store = new ObservableStore(initState);
  }
}

export default Web3Controller;
