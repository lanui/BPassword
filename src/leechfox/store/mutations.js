import * as types from './mutation-types';

export default {
  [types.UPDATE_ITEMS](state, items) {
    state.items = items || [];
  },
  [types.UPDATE_FEILD_VOLUME](state, { username = '', password = '' }) {
    state.feildVolume = Object.assign(state.feildVolume, { username, password });
  },
  [types.UPDATE_IS_UNLOCKED](state, isUnlocked) {
    state.isUnlocked = Boolean(isUnlocked);
  },
  [types.UPDATE_HOSTNAME](state, hostname) {
    state.hostname = hostname;
  },
  [types.SET_VIEW_PATH](state, viewPath) {
    state.viewPath = viewPath;
  },
  [types.UPDATE_ACTIVED_VALT_STATE](
    state,
    { username = '', password = '', hostname = '', ctype = 'init', activeField = '' }
  ) {
    state.valtState = Object.assign(state.valtState, {
      username,
      password,
      hostname,
      ctype,
      activeField: activeField,
    });
  },
};
