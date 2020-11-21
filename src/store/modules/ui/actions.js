import * as types from './mutation-types';

export const togglePopupDense = async ({ commit, state }) => {
  commit(types.UPDATE_P3_DENSE, !state.p3.dense);
};

export const togglePopupDrawer = async ({ commit, state }, drawer) => {
  const curDrawer = state.p3.drawer;
  if (typeof drawer === 'boolean') {
    commit(types.UPDATE_P3_DRAWER, drawer);
  } else {
    commit(types.UPDATE_P3_DRAWER, !curDrawer);
  }
};

export const setSnackbar = async ({ commit }, snackbar = {}) => {
  commit(types.UPDATE_SNACKBAR_STATE, snackbar);
};

export const setSnackbarText = async ({ commit }, text) => {
  commit(types.UPDATE_SNACKBAR_TEXT, text);
};

export const hiddenSnackbar = async ({ commit }) => {
  commit(types.UPDATE_SNACKBAR_TEXT, '');
};
