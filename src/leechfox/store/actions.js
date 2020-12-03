import * as types from './mutation-types';
import logger from '@lib/logger';

export const initHostname = async ({ commit }, hostname) => {};

/**
 *
 * @param {*} param0
 * @param {*} param1
 */
export const initState = async (
  { commit },
  { items = [], isUnlocked = false, hostname = '', feildValues = {}, valtState = {} }
) => {
  logger.debug('store>envLeech- remoteMessageListener>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', items);

  commit(types.UPDATE_IS_UNLOCKED, isUnlocked);
  commit(types.UPDATE_ITEMS, items);
  commit(types.UPDATE_HOSTNAME, hostname);
  commit(types.UPDATE_FEILD_VOLUME, feildValues);
  commit(types.UPDATE_ACTIVED_VALT_STATE, valtState);
  logger.debug('store>>>>valtState>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', JSON.stringify(valtState));
};

export const updateViewPath = async ({ commit }, viewPath = 'index') => {
  commit(types.SET_VIEW_PATH, viewPath);
};

export const updateValtState = async ({ commit }, valtState) => {
  logger.debug('Update Leech valtState>>>envLeech- remoteMessageListener>>> ', valtState);
  commit(types.UPDATE_ACTIVED_VALT_STATE, valtState);
};

/**
 *
 * @param {*} param0
 * @param {*} items
 */
export const updatePassItems = async ({ commit }, items) => {
  commit(types.UPDATE_ITEMS, items);
};
