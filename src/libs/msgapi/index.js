import * as APITypes from './api-types';
import BPError from '../biz-error';
import { APITYPE_ILLEGAL } from '../biz-error/error-codes';
/*********************************************************************
 * AircraftClass :: Platform Utils
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-21
 *    @comments:
 **********************************************************************/

/**
 *
 * @param {*} apiType
 */
export const checkApiType = (apiType) => {
  const apiTypeValts = Object.values(APITypes);
  if (apiTypeValts.find((it) => it === apiType)) return true;

  throw new BPError(`Message type :${apiType} unspport.`, APITYPE_ILLEGAL);
};
