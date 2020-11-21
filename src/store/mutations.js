import * as types from './mutation-types';

export default {
  [types.UPDATE_LOCALE](state, locale) {
    state.locale = locale;
  },
  [types.UPDATE_ENV3](state, env3) {
    state.env3 = env3;
  },
  [types.UPDATE_ISUNLOCKED](state, isUnlocked) {
    state.isUnlocked = Boolean(isUnlocked);
  },
};
