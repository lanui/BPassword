import * as types from './mutation-types';
export default {
  [types.UPDATE_P3_DENSE](state, dense) {
    state.p3.dense = Object.assign(state.p3, { dense: Boolean(dense) });
  },
  [types.UPDATE_P3_DRAWER](state, drawer) {
    state.p3.dense = Object.assign(state.p3, { drawer: drawer });
  },
  [types.UPDATE_SNACKBAR_STATE](
    state,
    { text, snackClass = '', color = 'success', timeout = 5000 }
  ) {
    state.snackbar.text = text || '';
    state.snackbar.color = color;
    state.snackbar.snackClass = snackClass;
    state.snackbar.timeout = timeout;
  },
  [types.UPDATE_SNACKBAR_TEXT](state, text) {
    state.snackbar.text = text || '';
  },
};
