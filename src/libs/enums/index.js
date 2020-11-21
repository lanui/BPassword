/*********************************************************************
 * AircraftClass :: Define the Background environment Tags
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-06
 **********************************************************************/
export const ENV_TYPE_FULLSCREEN = 'envTypeFullscreen';
export const ENV_TYPE_NOTIFICATION = 'envTypeNotification';
export const ENV_TYPE_BACKGROUND = 'envBackground';
export const ENV_TYPE_INJET = 'envInjet'; //constentscript
export const ENV_TYPE_INJET_TOP = 'envInjetTop';
export const ENV_TYPE_LEECH = 'envLeech'; // site pop page
export const ENV_TYPE_POPUP = 'envPopup';

export const COMMUNICATION_CONTENTSCRIPT_NAME = 'msg-contentscript';
export const COMMUNICATION_INJET_TOP_NAME = 'msg-injet-top';
export const COMMUNICATION_INJET_NAME = 'msg-injet';

/**
 * extension internal
 */
export const EXTENSION_INTERNAL_PROCESS = {
  [ENV_TYPE_POPUP]: true,
  [ENV_TYPE_FULLSCREEN]: true,
  [ENV_TYPE_NOTIFICATION]: true,
};

export const EXTENSION_CC_PROCESS = {
  [ENV_TYPE_LEECH]: true,
  [ENV_TYPE_INJET_TOP]: true,
  [ENV_TYPE_INJET]: true,
};

export const BROWSER_CHROME = 'chrome';
export const BROWSER_FIREFOX = 'firefox';
