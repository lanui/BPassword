import EventEmitter from 'events';
import ObservableStore from 'obs-store';

import logger from '@/libs/logger';

import { transferTerms } from '../utils/item-transfer';

/*********************************************************************
 * AircraftClass :: Management Passbook encrypted data
 *     @Description:
 *     @Description:
 * WARNINGS:
 *        this class dependency global api data_store
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-06
 **********************************************************************/
const MemStateStruct = {
  WebsiteState: null,
  MobileState: null,
};

const BlockerStruct = {
  websiteBlocker: [], //{address,blocknum,cypher64,datetime}
  mobileBlocker: [], //{address,blocknum,cypher64,datetime}
};

class PassbokController extends EventEmitter {
  constructor(opts = {}) {
    super();
    const initState = opts.initState || {};

    // bind contact address,history version will store: lastVersion
    this.store = new ObservableStore(Object.assign(MemStateStruct, BlockerStruct, initState));

    /**
     * @type {ObservableStore} [items,Plain]
     *
     */
    this.memStore = new ObservableStore(MemStateStruct);
  }

  async lock() {
    await this.memStore.putState(MemStateStruct);
  }

  /** */
  async unlock(subPriKey) {
    //const plainText = await this.store.getState()
    logger.debug('WebsiteController:unlock >>>>>>>>>>>>>>>>>', subPriKey);
    const { WebsiteState, MobileState } = await this.store.getState();

    try {
      //website
      const websiteState = decryState(subPriKey, WebsiteState, true);
      const memState = {
        WebsiteState: { Plain: websiteState.Plain, items: websiteState.items },
      };
      this.memStore.updateState(memState);
      return {
        WebsiteState: { websiteState },
      };
    } catch (error) {
      throw error;
    }
  }

  getState() {}
}

function decryState(subPriKey, state = null, isWebsite = false) {
  try {
    let Cypher64 = state && state.Cypher64 ? state.Cypher64 : null;
    let Plain,
      items = [];
    if (!Cypher64) {
      const f = InitFile(subPriKey);
      Plain = f.Plain;
      Cypher64 = f.Cypher64;
    } else {
      Plain = decryptToPlainTxt(subPriKey, Cypher64);
      items = transferTerms(Plain, isWebsite);
    }

    return {
      Cypher64,
      Plain,
      items,
    };
  } catch (error) {
    throw error;
  }
}

export default PassbokController;
