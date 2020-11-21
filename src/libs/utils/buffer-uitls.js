const Buffer = require('buffer/').Buffer;

/*********************************************************************
 * AircraftClass ::
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-04
 **********************************************************************/

/**
 *
 * @param {*} input
 */
export function stringToBuffer(input) {
  if (typeof input !== 'string') throw 'incorrect entry args.';

  return Buffer.from(input);
}
