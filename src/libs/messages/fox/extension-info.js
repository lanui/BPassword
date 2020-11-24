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
export const TOP_ENTRY_FILE = 'foxjet/top-injet.js';
export const SUB_ENTRY_FILE = 'foxjet/sub-injet.js';

export const injetExtState = () => {
  let runtime = extension.runtime;
  return {
    extid: runtime.id,
    topInjetSrc: runtime.getURL(TOP_ENTRY_FILE),
    subInjetSrc: runtime.getURL(TOP_ENTRY_FILE),
  };
};
