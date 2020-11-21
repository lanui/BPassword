import { buildExtVersion } from '@/libs/code-settings';

import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

/*********************************************************************
 * AircraftClass :: referer Backend ProfileController
 *     @Description: autoLockedTimeout
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-12
 **********************************************************************/
export default {
  namespaced: true,
  actions,
  mutations,
  getters: {
    currentVersion: (state) => state.currentVersion,
    finnacialHash: (state) => state.finnacialHash,
    autoLockedTimeout: (state) => state.autoLockedTimeout,
    ...getters,
  },
  state: {
    currentVersion: buildExtVersion,
    versions: [], //{version,nver,lastupdate}
    autoLockedTimeout: 5, //min forever
    finnacialHash: '0xBC52a198619553fc1A0F925bB5B2E6EfaA9e45F1',
  },
};
