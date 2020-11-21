import * as types from './mutation-types';

export default {
  [types.UPDATE_WEB_ITEMS](state, items) {
    state.webItems = items || [];
  },
  [types.UPDATE_WEBPLAIN](state, Plain) {
    state.webPlain = Plain || null;
  },
  [types.UPDATE_MOB_ITEMS](state, items) {
    state.mobItems = items || [];
  },
  [types.UPDATE_MOBPLAIN](state, Plain) {
    state.mobPlain = Plain || null;
  },
  [types.SET_TRANFER_ITEM](state, item) {
    state.transferItem = Object.assign({}, item);
  },
};
