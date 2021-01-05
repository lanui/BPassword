import * as types from './mutation-types';

/**
 *
 * @param {*} param0
 * @param {*} item
 */
export const pushTransferItem = async ({ commit }, item) => {
  if (typeof item !== 'object' || !item.title) throw 'item illegal.';
  commit(types.SET_TRANFER_ITEM, item);
};

export const resetTransferItem = async ({ commit }) => {
  commit(types.SET_TRANFER_ITEM, { title: '', username: '', password: '', hostname: '' });
};

/**
 *
 * @param {Object} vuex context
 * @param {Object} WebsiteController,MobileController
 */
export const setInitState = async (context, initState = {}) => {
  const { WebsiteController, MobileController } = initState;
  await reloadWebsiteController(context, WebsiteController);
  await reloadMobileController(context, MobileController);
};

/**
 *
 * @param {*} param0
 * @param {*} param1
 */
export const reloadWebsiteController = async ({ commit }, { items = [], Plain }) => {
  commit(types.UPDATE_WEB_ITEMS, items);
  commit(types.UPDATE_WEBPLAIN, Plain);
};

export const reloadMobileController = async ({ commit }, { items = [], Plain }) => {
  commit(types.UPDATE_MOBPLAIN, Plain);
  commit(types.UPDATE_MOB_ITEMS, items);
};

export const subInitState4Site = async ({ commit }, WebsiteController = {}) => {
  const { Plain, items = [] } = WebsiteController;
  commit(types.UPDATE_WEBPLAIN, Plain);
  commit(types.UPDATE_WEB_ITEMS, items);
};

export const subInitState4Mob = async ({ commit }, MobileController = {}) => {
  const { Plain, items = [] } = MobileController;
  commit(types.UPDATE_MOBPLAIN, Plain);
  commit(types.UPDATE_MOB_ITEMS, items);
};
