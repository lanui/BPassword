import Admin from './abis/Admin.json';
import BT from './abis/BT.json';
import bptMember from './abis/bptMember.json';
import bptStorage from './abis/bptStorage.json';
import bptStorageByEvent from './abis/bptStorageByEvent.json';

import customAddresses from './custom_address';
import ethAddresses from './addresses';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-14
 *    @comments:
 **********************************************************************/

export const SmartAddressesTranslate = () => {
  const smartAddresses = { ...ethAddresses, ...customAddresses };
  return smartAddresses;
};

/**
 * BPassword: 1.1.0
 * @build at: 2020-12-09 13:21:45
 **/
export default {
  Admin,
  BT,
  bptMember,
  bptStorage,
  bptStorageByEvent,
  smartAddresses: SmartAddressesTranslate(),
};
