import extension from '../../extensionizer';

/*********************************************************************
 * AircraftClass ::
 *    @description: firefox logic only
 *    @description: future will aplly to chrome
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-24
 *    @comments: Background support public to Trusted Page Info
 **********************************************************************/
export const TOP_ENTRY_FILE = 'inpage/top-injet.js';
export const SUB_ENTRY_FILE = 'inpage/sub-injet.js';
export const LEECH_INDEX_PATH = 'leech/leech.html';
export const LEECH_ADDOR_PATH = 'leech/leech.html#/add_passbook';
//#/add_passbook

export const injetExtState = (isChrome = false) => {
  let runtime = extension.runtime;
  return {
    extid: runtime.id,
    topInjetSrc: runtime.getURL(TOP_ENTRY_FILE),
    subInjetSrc: runtime.getURL(TOP_ENTRY_FILE),
    leechIndexSrc: runtime.getURL(LEECH_INDEX_PATH),
    leechaAddorSrc: runtime.getURL(LEECH_ADDOR_PATH),
  };
};
